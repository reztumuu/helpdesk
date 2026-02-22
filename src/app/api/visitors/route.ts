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
  const onlineOnly = searchParams.get('online') === 'true';
  const thresholdSec = Number(searchParams.get('threshold') || '30');
  const limitStr = searchParams.get('limit');

  const where: any = {};

  if (websiteId) {
    where.website_id = websiteId;
  }

  // Access to all websites for admin/agent created by super admin

  if (countOnly) {
    const whereOnline = { ...where };
    if (onlineOnly) {
      const cutoff = new Date(Date.now() - thresholdSec * 1000);
      (whereOnline as any).last_seen = { gte: cutoff };
    }
    const total = await prisma.visitor.count({ where: whereOnline });
    return NextResponse.json({ total });
  }

  const whereList = { ...where };
  if (onlineOnly) {
    const cutoff = new Date(Date.now() - thresholdSec * 1000);
    (whereList as any).last_seen = { gte: cutoff };
  }
  const limit = limitStr ? Number(limitStr) : 0;
  const visitors = await prisma.visitor.findMany({
    where: whereList,
    orderBy: { last_seen: 'desc' },
    take: limit > 0 ? limit : undefined,
  });

  return NextResponse.json(visitors);
}
