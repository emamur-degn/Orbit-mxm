import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user, paidOrders, totalOrders, activeProducts, totalCustomers, recentOrders] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: session.userId },
          select: { name: true, email: true, workspace: true, monthlyGoal: true },
        }),
        prisma.order.findMany({
          where: { paymentStatus: 'PAID' },
          select: { totalAmount: true, createdAt: true },
        }),
        prisma.order.count(),
        prisma.product.count({ where: { status: 'ACTIVE' } }),
        prisma.customer.count(),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: { select: { name: true, email: true } },
            items: { select: { productName: true, quantity: true } },
          },
        }),
      ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const conversionRate =
      totalOrders > 0 ? Number(((paidOrders.length / totalOrders) * 100).toFixed(2)) : 0;

    const monthlyGoal = user?.monthlyGoal || 34000;
    const goalPercentage = Math.min(100, Math.round((totalRevenue / monthlyGoal) * 100));

    // Build 12-month revenue series
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyMap = new Array(12).fill(0);
    for (const o of paidOrders) {
      const m = new Date(o.createdAt).getMonth();
      monthlyMap[m] += o.totalAmount;
    }

    const monthlyRevenue = monthNames.map((month, idx) => ({
      month,
      revenue: monthlyMap[idx],
    }));

    return NextResponse.json({
      user,
      kpis: {
        totalRevenue,
        activeCustomers: totalCustomers,
        activeProducts,
        conversionRate,
        totalOrders,
        paidOrdersCount: paidOrders.length,
        monthlyGoal,
        goalPercentage,
      },
      monthlyRevenue,
      recentOrders,
    });
  } catch (error) {
    console.error('Dashboard Stats API Error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard stats' }, { status: 500 });
  }
}
