import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const primaryDomain = await prisma.setting.findUnique({ where: { key: 'primary_domain' } });
    const publicSiteUrl = await prisma.setting.findUnique({ where: { key: 'public_site_url' } });
    const domainStatus = await prisma.setting.findUnique({ where: { key: 'domain_status' } });
    const sslEnabled = await prisma.setting.findUnique({ where: { key: 'ssl_enabled' } });

    return NextResponse.json({
      primary_domain: primaryDomain?.value || '',
      public_site_url: publicSiteUrl?.value || '',
      domain_status: domainStatus?.value || 'pending',
      ssl_enabled: sslEnabled?.value === 'true',
    });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json({ error: 'Failed to fetch domains' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = [
      { key: 'primary_domain', value: body.primary_domain },
      { key: 'public_site_url', value: body.public_site_url },
      { key: 'domain_status', value: body.domain_status || 'pending' },
      { key: 'ssl_enabled', value: body.ssl_enabled ? 'true' : 'false' },
    ];

    for (const setting of settings) {
      await prisma.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving domains:', error);
    return NextResponse.json({ error: 'Failed to save domains' }, { status: 500 });
  }
}