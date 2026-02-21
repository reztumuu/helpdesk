'use server';
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
    include: { visitor: true },
  });

  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  if (!chat.visitor || chat.visitor.session_id !== sessionId) {
    return NextResponse.json({ error: 'Unauthorized for this chat' }, { status: 403 });
  }

  const msgs = await prisma.message.findMany({
    where: { chat_id: chatId },
    orderBy: { created_at: 'asc' },
  });

  return NextResponse.json(msgs);
}
