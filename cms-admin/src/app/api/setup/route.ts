import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Save Razorpay keys
    await prisma.setting.upsert({
      where: { key: 'razorpay_key_id' },
      update: { value: 'rzp_live_RIPfjjB5364PaQ' },
      create: { key: 'razorpay_key_id', value: 'rzp_live_RIPfjjB5364PaQ' },
    });

    await prisma.setting.upsert({
      where: { key: 'razorpay_key_secret' },
      update: { value: 'E4RXLtukVoWQpZeXBUFQs6nA' },
      create: { key: 'razorpay_key_secret', value: 'E4RXLtukVoWQpZeXBUFQs6nA' },
    });

    await prisma.setting.upsert({
      where: { key: 'razorpay_enabled' },
      update: { value: 'true' },
      create: { key: 'razorpay_enabled', value: 'true' },
    });

    await prisma.setting.upsert({
      where: { key: 'currency' },
      update: { value: 'USD' },
      create: { key: 'currency', value: 'USD' },
    });

    // Update product prices from hdmuscle.in
    const productPrices = {
      'pumphd': 59.99,
      'prehd-essential': 29.99,
      'prehd-ultra': 44.99,
      'prehd-elite': 59.99,
      'prehd-black': 69.99,
      'stimhd': 16.49,
      'hydrahd': 29.99,
      'intra-hd': 42.99,
      'creahd-creapure': 42.99,
      'eaa-hd': 34.99,
      'gluta-hd': 22.99,
      'carbhd-new-formula': 49.99,
      'prohd-isolate': 79.99,
      'multihd': 37.99,
      'vita-hd': 44.99,
      'omega-3': 34.99,
      'sleephd': 39.99,
      'burn-hd': 44.99,
      'greenshd': 34.99,
      'glyco-hd': 49.99,
      'd3': 19.99,
      'curcumin': 32.99,
      'collagenhd': 39.99,
      'zinc': 17.99,
      'magnesium': 22.99,
      'k2': 24.99,
      'betaine-hcl': 24.99,
      'liverhd': 39.99,
      'kidneyhd': 34.99,
    };

    for (const [handle, price] of Object.entries(productPrices)) {
      const product = await prisma.product.findUnique({ where: { handle } });
      if (product) {
        await prisma.product.update({
          where: { id: product.id },
          data: { price, compare_at_price: price + 10 },
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Razorpay keys saved, prices updated!',
      updatedProducts: Object.keys(productPrices).length
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}