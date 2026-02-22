import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const websiteId = searchParams.get('websiteId');

  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (websiteId) {
    where.website_id = websiteId;
  }

  // Ensure user only sees chats for their websites
  // Or if they are super_admin, all?
  // For now, assume user manages their websites.
  
  // Access to all websites for admin/agent created by super admin

  const chats = await prisma.chat.findMany({
    where,
    include: {
      visitor: true,
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1
      },
      website: true,
      assignee: true
    },
    orderBy: { updated_at: 'desc' }
  });

  return NextResponse.json(chats);
}
