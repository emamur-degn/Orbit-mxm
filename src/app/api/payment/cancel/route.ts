import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function handleCancel(request: NextRequest) {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((v, k) => (params[k] = v));

  if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      formData.forEach((v, k) => (params[k] = String(v)));
    } catch {
      // ignore
    }
  }

  const tranId = params.tran_id;
  if (tranId) {
    const order = await prisma.order.findUnique({ where: { tranId } });
    if (order && order.paymentStatus !== 'PAID') {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'CANCELLED', status: 'CANCELLED' },
      });
      await prisma.paymentLog.create({
        data: {
          orderId: order.id,
          tranId,
          eventType: 'CANCEL',
          status: 'CANCELLED',
          amount: order.totalAmount,
          currency: order.currency,
          rawPayload: params as object,
        },
      });
    }
  }

  return NextResponse.redirect(
    `${appUrl}/dashboard/orders?payment=cancelled&tranId=${encodeURIComponent(tranId || '')}`,
    303
  );
}

export async function POST(request: NextRequest) {
  return handleCancel(request);
}

export async function GET(request: NextRequest) {
  return handleCancel(request);
}
