import { NextResponse } from 'next/server';

const CMS_API = process.env.CMS_API || 'https://cms.hdmuscle.in/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${CMS_API}/settings/global`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    const data = await res.json();

    return NextResponse.json({
      currency: data.currency || 'INR',
      locale: data.locale || 'en-IN',
      symbol: data.symbol || '₹',
      timezone: data.timezone || 'Asia/Kolkata',
      store_email: data.store_email || '',
      store_phone: data.store_phone || ''
    });
  } catch {
    return NextResponse.json({
      currency: 'INR',
      locale: 'en-IN',
      symbol: '₹',
      timezone: 'Asia/Kolkata'
    });
  }
}