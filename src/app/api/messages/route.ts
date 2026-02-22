import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const { chatId, content, type, sender } = await req.json();

  if (!chatId || !content || !sender) {
    return NextResponse.json({ error: 'ChatId, content, and sender are required' }, { status: 400 });
  }

  let senderId = undefined;

  if (sender === 'admin') {
      const session = await getSession();
      if (!session) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      senderId = session.id;
  }
  
  const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { website: true }
  });
  if (!chat) return NextResponse.json({ error: 'Chat not found' }, { status: 404 });

  // Create message
  const message = await prisma.message.create({
    data: {
      chat_id: chatId,
      content,
      type: type || 'text',
      sender_type: sender === 'admin' ? 'admin' : 'visitor',
      sender_id: senderId
    },
  });

  // Update chat updated_at
  await prisma.chat.update({
      where: { id: chatId },
      data: { updated_at: new Date() }
  });

  try {
    await fetch('http://localhost:3000/_socket/emit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'new-message',
        data: {
          chatId,
          content,
          sender,
          type: type || 'text',
          createdAt: (message as any).created_at,
          websiteId: chat.website.id,
          apiKey: (chat.website as any).api_key,
          id: (message as any).id
        }
      })
    });
  } catch (e) {
    // swallow: realtime is best-effort; DB is source of truth
  }
  
  return NextResponse.json(message);
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const chatId = searchParams.get('chatId');
  const limitStr = searchParams.get('limit');
  const orderParam = searchParams.get('order');

  if (!chatId) {
    return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
  }

  // Ensure access to chat
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: { website: true },
  });
  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  // Access allowed for admin/agent created by super admin

  const limit = limitStr ? Number(limitStr) : 0;
  const order = orderParam === 'desc' ? 'desc' : 'asc';
  const msgs = await prisma.message.findMany({
    where: { chat_id: chatId },
    orderBy: { created_at: order },
    take: limit > 0 ? limit : undefined,
  });

  return NextResponse.json(msgs);
}
