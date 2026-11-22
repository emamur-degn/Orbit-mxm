import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sslcommerz } from '@/lib/sslcommerz';

export async function POST(request: NextRequest) {
  try {
    const params: Record<string, string> = {};
    const formData = await request.formData();
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    const tranId = params.tran_id;
    const valId = params.val_id;
    const status = params.status;

    if (!tranId) {
      return NextResponse.json({ error: 'Missing tran_id in IPN' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { tranId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.paymentLog.create({
      data: {
        orderId: order.id,
        tranId,
        eventType: 'IPN',
        status: status || 'RECEIVED',
        amount: Number(params.amount || order.totalAmount),
        currency: params.currency || order.currency,
        rawPayload: params as object,
      },
    });

    if (status === 'VALID' && valId && order.paymentStatus !== 'PAID') {
      const validation = await sslcommerz.validateTransaction(valId);
      if (validation.status === 'VALID' || validation.status === 'VALIDATED') {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: 'COMPLETED',
              valId,
              bankTranId: validation.bank_tran_id || null,
              cardType: validation.card_type || null,
              cardBrand: validation.card_brand || null,
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
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('SSLCommerz IPN Error:', error);
    return NextResponse.json({ error: 'IPN processing failed' }, { status: 500 });
  }
}
