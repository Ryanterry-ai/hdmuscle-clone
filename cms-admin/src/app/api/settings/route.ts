import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const normalizedEntries = Object.entries(body).map(([key, value]) => {
      if (key === 'currency') return [key, 'INR'] as const;
      if (key === 'symbol') return [key, '₹'] as const;
      return [key, String(value ?? '')] as const;
    });

    const promises = normalizedEntries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      }),
    );
    await Promise.all(promises);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}

