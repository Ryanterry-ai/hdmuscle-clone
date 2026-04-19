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
    
    // Extract only valid fields for GlobalSettings
    const validFields = {
      store_name: typeof body.store_name === 'string' ? body.store_name : 'My Store',
      store_email: typeof body.store_email === 'string' ? body.store_email : '',
      store_phone: typeof body.store_phone === 'string' ? body.store_phone : '',
      store_address: typeof body.store_address === 'string' ? body.store_address : '',
      currency: typeof body.currency === 'string' ? body.currency : 'INR',
      timezone: typeof body.timezone === 'string' ? body.timezone : 'Asia/Kolkata',
      primary_color: typeof body.primary_color === 'string' ? body.primary_color : '#f59e0b',
      accent_color: typeof body.accent_color === 'string' ? body.accent_color : '#ea580c',
    };
    
    // Upsert global settings
    await prisma.globalSettings.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        ...validFields,
      },
      update: validFields,
    });
    
    return NextResponse.json({ success: true, currency: validFields.currency });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings', details: String(error) }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}