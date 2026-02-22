import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { apiKey, sessionId } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { api_key: apiKey },
    });

    if (!website || !website.is_active) {
      return NextResponse.json({ error: 'Invalid API key or inactive website' }, { status: 401 });
    }

    // Get or create visitor by sessionId
    let sid = sessionId as string | undefined;
    if (!sid) sid = crypto.randomBytes(16).toString('hex');
    let visitor = await prisma.visitor.findUnique({ where: { session_id: sid } });
    if (!visitor) {
      visitor = await prisma.visitor.create({
        data: {
          website_id: website.id,
          session_id: sid,
        },
      });
    } else {
      // ensure same website
      if (visitor.website_id !== website.id) {
        visitor = await prisma.visitor.create({
          data: {
            website_id: website.id,
            session_id: sid!,
          },
        });
      } else {
        await prisma.visitor.update({
          where: { session_id: sid! },
          data: { last_seen: new Date() },
        });
      }
    }

    // Reuse existing open chat for this visitor
    let chat = await prisma.chat.findFirst({
      where: {
        website_id: website.id,
        visitor_id: visitor.id,
        status: { in: ['waiting', 'ongoing'] }
      },
      orderBy: { updated_at: 'desc' }
    });
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          website_id: website.id,
          visitor_id: visitor.id,
          status: 'waiting'
        },
      });
      try {
        await prisma.activityLog.create({
          data: {
            user_id: website.user_id,
            action: 'chat_started',
            resource_type: 'chat',
            resource_id: chat.id,
            metadata: { visitorId: visitor.id },
          },
        });
      } catch {}
      try {
        await fetch('http://localhost:3000/_socket/emit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'chat-started',
            data: {
              websiteId: website.id,
              apiKey: website.api_key,
              chatId: chat.id
            }
          })
        });
      } catch {}
    }

    return NextResponse.json({ id: chat.id, visitorId: visitor.id, sessionId: sid });
  } catch (error) {
    console.error('Start chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
