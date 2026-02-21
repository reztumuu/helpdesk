import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const websiteId = searchParams.get('websiteId');
  const countOnly = searchParams.get('count') === 'true';

  const where: any = {};

  if (websiteId) {
    where.website_id = websiteId;
  }

  // Access to all websites for admin/agent created by super admin

  if (countOnly) {
    const total = await prisma.visitor.count({ where });
    return NextResponse.json({ total });
  }

  const visitors = await prisma.visitor.findMany({
    where,
    orderBy: { last_seen: 'desc' },
  });

  return NextResponse.json(visitors);
}
