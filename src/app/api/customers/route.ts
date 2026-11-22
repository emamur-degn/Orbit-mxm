import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(6, 'Phone number is required'),
  company: z.string().optional(),
  address: z.string().default('Dhaka'),
  city: z.string().default('Dhaka'),
  country: z.string().default('Bangladesh'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    const customers = await prisma.customer.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: {
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('GET /api/customers error:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const parsed = customerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid customer data' },
        { status: 400 }
      );
    }

    const email = parsed.data.email.toLowerCase().trim();
    const customer = await prisma.customer.upsert({
      where: { email },
      update: {
        name: parsed.data.name.trim(),
        phone: parsed.data.phone.trim(),
        company: parsed.data.company?.trim(),
        address: parsed.data.address,
        city: parsed.data.city,
        country: parsed.data.country,
      },
      create: {
        ...parsed.data,
        email,
      },
    });

    return NextResponse.json({ message: 'Customer saved', customer }, { status: 201 });
  } catch (error) {
    console.error('POST /api/customers error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
