import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => { settingsMap[s.key] = s.value; });
    
    // Also get global settings
    const global = await prisma.globalSettings.findFirst();
    if (global) {
      settingsMap.store_name = global.store_name;
      settingsMap.store_email = global.store_email || '';
      settingsMap.store_phone = global.store_phone || '';
      settingsMap.store_address = global.store_address || '';
      settingsMap.currency = global.currency;
      settingsMap.timezone = global.timezone;
      settingsMap.logo = global.logo || '';
      settingsMap.favicon = global.favicon || '';
      settingsMap.primary_color = global.primary_color;
      settingsMap.accent_color = global.accent_color;
    }
    
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error('Settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Upsert global settings
    await prisma.globalSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        store_name: body.store_name || 'My Store',
        store_email: body.store_email,
        store_phone: body.store_phone,
        store_address: body.store_address,
        currency: body.currency || 'INR',
        timezone: body.timezone || 'Asia/Kolkata',
        primary_color: body.primary_color || '#f59e0b',
        accent_color: body.accent_color || '#ea580c',
      },
      update: {
        store_name: body.store_name || 'My Store',
        store_email: body.store_email,
        store_phone: body.store_phone,
        store_address: body.store_address,
        currency: body.currency || 'INR',
        timezone: body.timezone || 'Asia/Kolkata',
        primary_color: body.primary_color || '#f59e0b',
        accent_color: body.accent_color || '#ea580c',
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}