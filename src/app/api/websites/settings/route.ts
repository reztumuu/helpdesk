import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { websiteId, position, primaryColor, customization } = body as {
      websiteId: string;
      position?: 'bottom_right' | 'bottom_left' | 'bottom-right' | 'bottom-left';
      primaryColor?: string;
      customization?: { iconUrl?: string; offsetX?: number; offsetY?: number };
    };
    if (!websiteId) {
      return NextResponse.json({ error: 'websiteId required' }, { status: 400 });
    }
    const settings = await prisma.widgetSettings.findUnique({
      where: { website_id: websiteId },
    });
    const updates: any = {};
    if (primaryColor) updates.primary_color = primaryColor;
    if (position) {
      updates.position = position === 'bottom-left' ? 'bottom_left' : position === 'bottom-right' ? 'bottom_right' : position;
    }
    if (customization) {
      const prev = settings?.custom_css || '{}';
      let obj: any = {};
      try {
        obj = JSON.parse(prev);
      } catch {}
      if ('iconUrl' in customization) {
        const val = customization.iconUrl as any;
        if (val === '' || val === null) {
          if ('iconUrl' in obj) delete obj.iconUrl;
        } else {
          obj.iconUrl = val;
        }
      }
      if (typeof customization.offsetX === 'number') obj.offsetX = customization.offsetX;
      if (typeof customization.offsetY === 'number') obj.offsetY = customization.offsetY;
      updates.custom_css = JSON.stringify(obj);
    }
    const updated = await prisma.widgetSettings.update({
      where: { website_id: websiteId },
      data: updates,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
