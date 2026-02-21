'use server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Get websites user has access to
  const allSites = await prisma.website.findMany({ select: { id: true } });
  const websiteIds = allSites.map(s => s.id);
  const now = new Date();
  const daysBack = 7;
  const cutoffVisitors = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  const visitors = await prisma.visitor.findMany({
    where: {
      website_id: { in: websiteIds },
      last_seen: { gte: cutoffVisitors }
    },
    orderBy: { last_seen: 'asc' }
  });
  const trendMap: Record<string, number> = {};
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    trendMap[formatDate(d)] = 0;
  }
  visitors.forEach(v => {
    const key = formatDate(new Date(v.last_seen ?? v.created_at));
    if (trendMap[key] !== undefined) trendMap[key] += 1;
  });
  const visitorLabels = Object.keys(trendMap);
  const visitorCounts = visitorLabels.map(k => trendMap[k]);
  const cutoffChats = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const chats = await prisma.chat.findMany({
    where: {
      website_id: { in: websiteIds },
      created_at: { gte: cutoffChats }
    },
    include: {
      messages: {
        orderBy: { created_at: 'asc' }
      }
    },
    orderBy: { created_at: 'asc' }
  });
  // Response time per day
  const respMap: Record<string, { sum: number; count: number }> = {};
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    respMap[formatDate(d)] = { sum: 0, count: 0 };
  }
  chats.forEach(c => {
    const msgs = c.messages;
    let firstVisitor: Date | null = null;
    let firstAdminAfter: Date | null = null;
    for (const m of msgs) {
      if (!firstVisitor && m.sender_type === 'visitor') {
        firstVisitor = m.created_at;
      } else if (firstVisitor && m.sender_type === 'admin') {
        firstAdminAfter = m.created_at;
        break;
      }
    }
    if (firstVisitor && firstAdminAfter) {
      const diffSec = (firstAdminAfter.getTime() - firstVisitor.getTime()) / 1000;
      const key = formatDate(c.created_at);
      if (respMap[key]) {
        respMap[key].sum += diffSec;
        respMap[key].count += 1;
      }
    }
  });
  const respLabels = Object.keys(respMap);
  const respSeconds = respLabels.map(k => {
    const { sum, count } = respMap[k];
    return count > 0 ? Math.round(sum / count) : 0;
  });
  // Totals
  const totalVisitors = await prisma.visitor.count({
    where: { website_id: { in: websiteIds } }
  });
  const allChats = await prisma.chat.findMany({
    where: { website_id: { in: websiteIds } }
  });
  const activeChats = allChats.filter(c => c.status === 'waiting' || c.status === 'ongoing').length;
  const conversations30d = allChats.filter(c => c.created_at >= cutoffChats).length;
  return NextResponse.json({
    visitorsTrend: { labels: visitorLabels, counts: visitorCounts },
    responseTime: { labels: respLabels, seconds: respSeconds },
    totals: { visitors: totalVisitors, activeChats, conversations30d }
  });
}
