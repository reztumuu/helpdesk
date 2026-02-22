import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');
  const sessionId = searchParams.get('sessionId');

  if (!chatId || !sessionId) {
    return NextResponse.json({ error: 'chatId and sessionId are required' }, { status: 400 });
  }

  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { visitor: true, assignee: true, website: true },
  });

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  if (!chat.visitor || chat.visitor.session_id !== sessionId) {
    return NextResponse.json({ error: 'Unauthorized for this chat' }, { status: 403 });
  }

  return NextResponse.json({
    id: chat.id,
    status: chat.status,
    assigned_to: chat.assigned_to,
    assignee: chat.assignee ? { id: chat.assignee.id, name: chat.assignee.name } : null,
    websiteId: chat.website_id,
  });
}
