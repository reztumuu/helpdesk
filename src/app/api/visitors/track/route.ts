import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    let apiKey: string | null = null;
    let sessionId: string | undefined = undefined;
    try {
      const body = await req.json();
      apiKey = (body && typeof body.apiKey === 'string') ? body.apiKey : null;
      sessionId = (body && typeof body.sessionId === 'string') ? body.sessionId : undefined;
    } catch {
      apiKey = null;
      sessionId = undefined;
    }
    if (!apiKey) {
      const { searchParams } = new URL(req.url);
      apiKey = searchParams.get('apiKey');
      const sidQ = searchParams.get('sessionId');
      if (sidQ) sessionId = sidQ;
    }

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
      try {
        await prisma.activityLog.create({
          data: {
            user_id: website.user_id,
            action: 'visitor_online',
            resource_type: 'visitor',
            resource_id: visitor.id,
            metadata: { sessionId: sid },
          },
        });
      } catch {}
    }

    return NextResponse.json({ sessionId: sid, visitorId: visitor.id, websiteId: website.id });
  } catch (error) {
    console.error('Track visitor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
