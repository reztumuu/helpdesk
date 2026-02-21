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

    let sid = sessionId as string | undefined;
    if (!sid) {
      sid = crypto.randomBytes(16).toString('hex');
    }

    const existing = await prisma.visitor.findUnique({
      where: { session_id: sid },
    });

    let visitor;
    if (existing) {
      visitor = await prisma.visitor.update({
        where: { session_id: sid },
        data: { last_seen: new Date() },
      });
    } else {
      visitor = await prisma.visitor.create({
        data: {
          website_id: website.id,
          session_id: sid,
        },
      });
    }

    return NextResponse.json({ sessionId: sid, visitorId: visitor.id, websiteId: website.id });
  } catch (error) {
    console.error('Track visitor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
