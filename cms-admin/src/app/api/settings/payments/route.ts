import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

async function getSettingValue(key: string) {
  const record = await prisma.setting.findUnique({ where: { key } });
  return record?.value || '';
}

function toBoolean(value: string | undefined) {
  return String(value || '').toLowerCase() === 'true';
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const [
      razorpayKeyId,
      razorpayKeySecret,
      razorpayEnabled,
      currency,
      currencySymbol,
      snapmintEnabled,
      snapmintCheckoutUrl,
      snapmintMerchantId,
    ] = await Promise.all([
      getSettingValue('razorpay_key_id'),
      getSettingValue('razorpay_key_secret'),
      getSettingValue('razorpay_enabled'),
      getSettingValue('currency'),
      getSettingValue('currency_symbol'),
      getSettingValue('snapmint_enabled'),
      getSettingValue('snapmint_checkout_url'),
      getSettingValue('snapmint_merchant_id'),
    ]);

    return NextResponse.json({
      razorpay_key_id: razorpayKeyId,
      razorpay_key_secret: razorpayKeySecret ? 'configured' : '',
      razorpay_enabled: razorpayEnabled ? toBoolean(razorpayEnabled) : Boolean(razorpayKeyId),
      currency: currency || 'INR',
      currencySymbol: currencySymbol || String.fromCharCode(8377),
      snapmint_enabled: toBoolean(snapmintEnabled),
      snapmint_checkout_url: snapmintCheckoutUrl,
      snapmint_merchant_id: snapmintMerchantId,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const entries: Array<{ key: string; value: string }> = [];

    if (body.razorpay_key_id !== undefined) {
      entries.push({ key: 'razorpay_key_id', value: String(body.razorpay_key_id || '') });
    }

    if (body.razorpay_key_secret !== undefined) {
      entries.push({ key: 'razorpay_key_secret', value: String(body.razorpay_key_secret || '') });
    }

    if (body.razorpay_enabled !== undefined) {
      entries.push({ key: 'razorpay_enabled', value: body.razorpay_enabled ? 'true' : 'false' });
    }

    if (body.currency !== undefined) {
      entries.push({ key: 'currency', value: String(body.currency || 'INR') });
    }

    if (body.currencySymbol !== undefined) {
      entries.push({ key: 'currency_symbol', value: String(body.currencySymbol || String.fromCharCode(8377)) });
    }

    if (body.snapmint_enabled !== undefined) {
      entries.push({ key: 'snapmint_enabled', value: body.snapmint_enabled ? 'true' : 'false' });
    }

    if (body.snapmint_checkout_url !== undefined) {
      entries.push({ key: 'snapmint_checkout_url', value: String(body.snapmint_checkout_url || '') });
    }

    if (body.snapmint_merchant_id !== undefined) {
      entries.push({ key: 'snapmint_merchant_id', value: String(body.snapmint_merchant_id || '') });
    }

    await Promise.all(
      entries.map((entry) =>
        prisma.setting.upsert({
          where: { key: entry.key },
          update: { value: entry.value },
          create: { key: entry.key, value: entry.value },
        }),
      ),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}

