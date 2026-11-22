import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sslcommerz } from '@/lib/sslcommerz';

const initPaymentSchema = z.object({
  orderId: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.coerce.number().int().min(1).default(1),
  customerName: z.string().min(2).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().min(6).optional(),
  customerAddress: z.string().optional(),
  customerCity: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = initPaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid payment initialization payload' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    let order = null;

    // Case A: Initiate SSLCommerz payment for an existing pending Order ID
    if (data.orderId) {
      order = await prisma.order.findUnique({
        where: { id: data.orderId },
        include: { customer: true, items: true },
      });

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }
      if (order.paymentStatus === 'PAID') {
        return NextResponse.json({ error: 'Order is already paid' }, { status: 400 });
      }

      // Generate a fresh tranId if retrying payment
      const freshTranId = `ORB_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
      order = await prisma.order.update({
        where: { id: order.id },
        data: { tranId: freshTranId, paymentStatus: 'PENDING' },
        include: { customer: true, items: true },
      });
    } else {
      // Case B: Direct Checkout (Create Customer + Order + SSLCommerz Session)
      if (!data.productId || !data.customerName || !data.customerEmail || !data.customerPhone) {
        return NextResponse.json(
          { error: 'productId, customerName, customerEmail, and customerPhone are required' },
          { status: 400 }
        );
      }

      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      const customer = await prisma.customer.upsert({
        where: { email: data.customerEmail.toLowerCase().trim() },
        update: {
          name: data.customerName.trim(),
          phone: data.customerPhone.trim(),
          address: data.customerAddress || 'Dhaka',
          city: data.customerCity || 'Dhaka',
        },
        create: {
          name: data.customerName.trim(),
          email: data.customerEmail.toLowerCase().trim(),
          phone: data.customerPhone.trim(),
          address: data.customerAddress || 'Dhaka',
          city: data.customerCity || 'Dhaka',
        },
      });

      const subtotal = product.price * data.quantity;
      const timestamp = Date.now();
      const orderNumber = `ORD-${new Date().getFullYear()}-${String(timestamp).slice(-5)}`;
      const tranId = `ORB_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;

      order = await prisma.order.create({
        data: {
          orderNumber,
          tranId,
          customerId: customer.id,
          subtotal,
          tax: 0,
          totalAmount: subtotal,
          currency: product.currency || 'BDT',
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: 'SSLCOMMERZ',
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                quantity: data.quantity,
                unitPrice: product.price,
                totalPrice: subtotal,
              },
            ],
          },
        },
        include: { customer: true, items: true },
      });
    }

    const productSummary = order.items.map((i) => i.productName).join(', ') || 'Orbit SaaS Plan';

    const sslResponse = await sslcommerz.initPayment({
      tran_id: order.tranId,
      total_amount: order.totalAmount,
      currency: order.currency || 'BDT',
      product_name: productSummary,
      product_category: 'SaaS Subscription',
      cus_name: order.customer.name,
      cus_email: order.customer.email,
      cus_phone: order.customer.phone,
      cus_add1: order.customer.address,
      cus_city: order.customer.city,
      cus_country: order.customer.country,
    });

    await prisma.paymentLog.create({
      data: {
        orderId: order.id,
        tranId: order.tranId,
        eventType: 'INIT',
        status: sslResponse.status || 'UNKNOWN',
        amount: order.totalAmount,
        currency: order.currency,
        rawPayload: sslResponse as object,
      },
    });

    if (sslResponse.status !== 'SUCCESS' || !sslResponse.GatewayPageURL) {
      return NextResponse.json(
        {
          error: sslResponse.failedreason || 'SSLCommerz session initialization failed',
          gatewayResponse: sslResponse,
        },
        { status: 502 }
      );
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { gatewaySession: sslResponse.sessionkey || null },
    });

    return NextResponse.json({
      message: 'SSLCommerz checkout session initialized',
      orderId: order.id,
      orderNumber: order.orderNumber,
      tranId: order.tranId,
      gatewayUrl: sslResponse.GatewayPageURL,
    });
  } catch (error) {
    console.error('SSLCommerz Init Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
