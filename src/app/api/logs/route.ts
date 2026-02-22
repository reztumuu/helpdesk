import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const limitStr = searchParams.get('limit');
  const limit = limitStr ? Number(limitStr) : 25;
  const logs = await prisma.activityLog.findMany({
    orderBy: { created_at: 'desc' },
    take: limit,
  });
  return NextResponse.json(logs);
}
