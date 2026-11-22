import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const createOrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(6),
  customerAddress: z.string().default('Dhaka'),
  customerCity: z.string().default('Dhaka'),
  productId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).default(1),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('paymentStatus');
    const search = searchParams.get('search')?.trim();

    const orders = await prisma.order.findMany({
      where: {
        ...(paymentStatus && paymentStatus !== 'ALL'
          ? { paymentStatus: paymentStatus as 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' }
          : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { tranId: { contains: search, mode: 'insensitive' } },
                { customer: { name: { contains: search, mode: 'insensitive' } } },
                { customer: { email: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('GET /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid order request' },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      customerCity,
      productId,
      quantity,
      notes,
    } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: 'Selected product not found' }, { status: 404 });
    }

    const customer = await prisma.customer.upsert({
      where: { email: customerEmail.toLowerCase().trim() },
      update: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerAddress,
        city: customerCity,
      },
      create: {
        name: customerName.trim(),
        email: customerEmail.toLowerCase().trim(),
        phone: customerPhone.trim(),
        address: customerAddress,
        city: customerCity,
      },
    });

    const subtotal = product.price * quantity;
    const timestamp = Date.now();
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(timestamp).slice(-5)}`;
    const tranId = `ORB_${timestamp}_${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        tranId,
        customerId: customer.id,
        subtotal,
        tax: 0,
        totalAmount: subtotal,
        currency: product.currency,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        paymentMethod: 'SSLCOMMERZ',
        notes,
        items: {
          create: [
            {
              productId: product.id,
              productName: product.name,
              quantity,
              unitPrice: product.price,
              totalPrice: subtotal,
            },
          ],
        },
      },
      include: {
        customer: true,
        items: true,
      },
    });

    return NextResponse.json({ message: 'Order created', order }, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
