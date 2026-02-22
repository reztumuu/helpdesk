import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const apiKey = searchParams.get('apiKey');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is required' }, { status: 400 });
  }

  const website = await prisma.website.findUnique({
    where: { api_key: apiKey },
    include: { settings: true }
  });

  if (!website || !website.is_active) {
    return NextResponse.json({ error: 'Invalid API key or inactive website' }, { status: 401 });
  }

  const settings = website.settings || {
    primary_color: '#f59e0b',
    position: 'bottom-right',
    welcome_message: 'Hello! How can we help you today?',
    offline_message: 'We are currently offline.',
    widget_size: 'normal'
  };

  let customization: any = {};
  try {
    const raw = website.settings?.custom_css as any;
    customization = raw ? JSON.parse(raw) : {};
  } catch {}

  return NextResponse.json({
    websiteId: website.id,
    websiteName: website.name,
    ...settings,
    iconUrl: customization.iconUrl || '',
    offsetX: typeof customization.offsetX === 'number' ? customization.offsetX : 20,
    offsetY: typeof customization.offsetY === 'number' ? customization.offsetY : 50
  });
}
