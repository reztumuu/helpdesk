import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { chatId, sessionId, stars, comment } = await req.json();
    if (!chatId || !sessionId || typeof stars !== 'number') {
      return NextResponse.json({ error: 'chatId, sessionId, and stars are required' }, { status: 400 });
    }
    if (stars < 1 || stars > 5) {
      return NextResponse.json({ error: 'stars must be between 1 and 5' }, { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { visitor: true, website: true },
    });
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    if (!chat.visitor || chat.visitor.session_id !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized for this chat' }, { status: 403 });
    }

    const existing = await prisma.chatRating.findUnique({
      where: { chat_id: chatId },
    });
    let rating;
    if (existing) {
      rating = await prisma.chatRating.update({
        where: { chat_id: chatId },
        data: {
          stars,
          comment: typeof comment === 'string' ? comment : existing.comment,
        },
      });
    } else {
      rating = await prisma.chatRating.create({
        data: {
          chat_id: chatId,
          website_id: chat.website_id,
          visitor_id: chat.visitor_id,
          stars,
          comment: typeof comment === 'string' ? comment : null,
        },
      });
    }
    return NextResponse.json({ ok: true, rating });
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
