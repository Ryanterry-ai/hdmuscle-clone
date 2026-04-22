import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const DEFAULT_CURRENCY = 'INR';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const keyId = process.env.RAZORPAY_KEY_ID || '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || '';

    const updates = [
      { key: 'currency', value: DEFAULT_CURRENCY },
      { key: 'razorpay_enabled', value: keyId ? 'true' : 'false' },
    ];

    if (keyId) {
      updates.push({ key: 'razorpay_key_id', value: keyId });
    }

    if (keySecret) {
      updates.push({ key: 'razorpay_key_secret', value: keySecret });
    }

    await Promise.all(
      updates.map((entry) =>
        prisma.setting.upsert({
          where: { key: entry.key },
          update: { value: entry.value },
          create: { key: entry.key, value: entry.value },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Setup completed',
      applied: updates.map((entry) => entry.key),
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}
