import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sslcommerz } from '@/lib/sslcommerz';

async function extractCallbackParams(request: NextRequest): Promise<Record<string, string>> {
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value;
  });

  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        params[key] = String(value);
      });
    } else {
      try {
        const json = await request.json();
        Object.entries(json).forEach(([k, v]) => {
          params[k] = String(v);
        });
      } catch {
        // Ignore empty body
      }
    }
  }
  return params;
}

async function handleSuccessCallback(request: NextRequest) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  try {
    const payload = await extractCallbackParams(request);
    const tranId = payload.tran_id;
    const valId = payload.val_id;

    if (!tranId || !valId) {
      return NextResponse.redirect(`${appUrl}/dashboard/orders?payment=error&reason=missing_params`, 303);
    }

    const order = await prisma.order.findUnique({
      where: { tranId },
      include: { customer: true, items: true },
    });

    if (!order) {
      return NextResponse.redirect(`${appUrl}/dashboard/orders?payment=error&reason=order_not_found`, 303);
    }

    // Call SSLCommerz Order Validation API to prevent spoofing
    const validation = await sslcommerz.validateTransaction(valId);

    await prisma.paymentLog.create({
      data: {
        orderId: order.id,
        tranId,
        eventType: 'SUCCESS_VALIDATION',
        status: validation.status || 'UNKNOWN',
        amount: Number(validation.amount || order.totalAmount),
        currency: validation.currency || order.currency,
        rawPayload: { callback: payload, validation } as object,
      },
    });

    const isValidStatus = validation.status === 'VALID' || validation.status === 'VALIDATED';
    const paidAmount = Number(validation.amount || 0);
    const amountMatches = Math.abs(paidAmount - order.totalAmount) < 1;

    if (!isValidStatus || !amountMatches) {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
      });
      return NextResponse.redirect(
        `${appUrl}/dashboard/orders?payment=failed&tranId=${encodeURIComponent(tranId)}`,
        303
      );
    }

    // Idempotent update: only increment customer stats if not already PAID
    if (order.paymentStatus !== 'PAID') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            status: 'COMPLETED',
            valId,
            bankTranId: validation.bank_tran_id || payload.bank_tran_id || null,
            cardType: validation.card_type || payload.card_type || null,
            cardBrand: validation.card_brand || payload.card_brand || null,
            paidAt: new Date(),
          },
        }),
        prisma.customer.update({
          where: { id: order.customerId },
          data: {
            totalSpent: { increment: order.totalAmount },
            ordersCount: { increment: 1 },
          },
        }),
      ]);
    }

    return NextResponse.redirect(
      `${appUrl}/dashboard/orders?payment=success&orderNumber=${encodeURIComponent(order.orderNumber)}`,
      303
    );
  } catch (error) {
    console.error('SSLCommerz Success Callback Error:', error);
    return NextResponse.redirect(`${appUrl}/dashboard/orders?payment=error`, 303);
  }
}

export async function POST(request: NextRequest) {
  return handleSuccessCallback(request);
}

export async function GET(request: NextRequest) {
  return handleSuccessCallback(request);
}
