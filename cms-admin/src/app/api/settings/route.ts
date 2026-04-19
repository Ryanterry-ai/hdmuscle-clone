import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
    const body = await request.json();
    const promises = Object.entries(body).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: value as string },
        update: { value: value as string },
      })
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
