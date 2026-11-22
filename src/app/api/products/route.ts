import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().default('SaaS Plan'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  currency: z.string().default('BDT'),
  billingInterval: z.enum(['ONE_TIME', 'MONTHLY', 'YEARLY']).default('MONTHLY'),
  stock: z.coerce.number().int().min(0).default(999),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('ACTIVE'),
  features: z.array(z.string()).optional(),
});

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') +
    '-' +
    Math.floor(1000 + Math.random() * 9000)
  );
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim();

    const products = await prisma.product.findMany({
      where: {
        ...(status && status !== 'ALL' ? { status: status as 'ACTIVE' | 'DRAFT' | 'ARCHIVED' } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid product payload' },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const generatedSku =
      data.sku?.trim() ||
      `ORB-${data.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const product = await prisma.product.create({
      data: {
        name: data.name.trim(),
        slug: slugify(data.name),
        sku: generatedSku,
        description: data.description?.trim() || '',
        category: data.category,
        price: data.price,
        currency: data.currency,
        billingInterval: data.billingInterval,
        stock: data.stock,
        status: data.status,
        features: data.features || [],
        createdById: session.userId,
      },
    });

    return NextResponse.json({ message: 'Product created', product }, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
