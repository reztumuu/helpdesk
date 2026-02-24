import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { chatId } = await req.json();
    if (!chatId) {
      return NextResponse.json({ error: 'chatId is required' }, { status: 400 });
    }
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { website: true, assignee: true },
    });
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    const canEnd = session.role === 'super_admin' || chat.assigned_to === session.id;
    if (!canEnd) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: { status: 'closed', ended_at: new Date(), updated_at: new Date() },
      include: { website: true, assignee: true },
    });
    let lastMsg: any = null;
    try {
      lastMsg = await prisma.message.findFirst({
        where: { chat_id: chatId },
        orderBy: { created_at: 'desc' },
        select: { id: true, content: true, sender_type: true, created_at: true },
      });
    } catch {}
    const endedChat = {
      id: updated.id,
      visitor_id: (updated as any).visitor_id,
      assigned_to: updated.assigned_to,
      status: updated.status,
      ended_at: updated.ended_at,
      updated_at: updated.updated_at,
      assignee: updated.assignee ? { id: updated.assignee.id, name: updated.assignee.name } : null,
      messages: lastMsg ? [lastMsg] : [],
    };
    try {
      await prisma.activityLog.create({
        data: {
          user_id: session.id,
          action: 'chat_ended',
          resource_type: 'chat',
          resource_id: chatId,
          metadata: { assigneeId: session.id, assigneeName: updated.assignee?.name || 'Agent' },
        },
      });
    } catch {}
    try {
      await fetch('http://localhost:3000/_socket/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'chat-ended',
          data: {
            chatId,
            websiteId: updated.website.id,
            apiKey: (updated.website as any).api_key,
            chat: endedChat,
          },
        }),
      });
    } catch {}
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
