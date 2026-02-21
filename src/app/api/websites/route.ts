import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, domain } = await req.json();

    if (!name || !domain) {
      return NextResponse.json({ error: 'Name and domain are required' }, { status: 400 });
    }

    // Generate API Key
    const apiKey = crypto.randomBytes(32).toString('hex');

    const website = await prisma.website.create({
      data: {
        name,
        domain,
        api_key: apiKey,
        user: { connect: { id: session.id } },
        settings: {
            create: {
                welcome_message: "Hello! How can we help you today?",
                primary_color: "#2563eb",
                position: "bottom_right"
            }
        }
      },
    });

    const embedCode = `<script src="${process.env.NEXTAUTH_URL}/widget.js" data-key="${website.api_key}"></script>`;

    return NextResponse.json({
      id: website.id,
      apiKey: website.api_key,
      embedCode,
    });
  } catch (error) {
    console.error('Create website error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const websites = await prisma.website.findMany({
    include: {
        settings: true
    }
  });

  return NextResponse.json(websites);
}
