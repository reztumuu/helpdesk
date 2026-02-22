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

    // Assign current user if unassigned, otherwise return conflict if assigned to someone else
    if (chat.assigned_to && chat.assigned_to !== session.id) {
      const assignedUser = await prisma.user.findUnique({
        where: { id: chat.assigned_to },
        select: { id: true, name: true, email: true },
      });
      return NextResponse.json(
        { error: 'Chat already assigned', assignee: assignedUser },
        { status: 409 }
      );
    }

    const updated = await prisma.chat.update({
      where: { id: chatId },
      data: {
        assigned_to: session.id,
        status: 'ongoing',
        updated_at: new Date(),
      },
      include: { website: true, assignee: true },
    });

    try {
      await fetch('http://localhost:3000/_socket/emit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'chat-joined',
          data: {
            chatId,
            assigneeId: session.id,
            assigneeName: updated.assignee?.name || 'Agent',
            websiteId: updated.website.id,
            apiKey: (updated.website as any).api_key,
          },
        }),
      });
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
