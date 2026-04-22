import { NextResponse } from 'next/server';
import { getCmsApiBaseUrl } from '../../../lib/site-config';

const CMS_API = getCmsApiBaseUrl();

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${CMS_API}/settings/global`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    const data = await res.json();

    return NextResponse.json({
      currency: data.currency || 'INR',
      locale: data.locale || 'en-IN',
      symbol: data.symbol || String.fromCharCode(8377),
      timezone: data.timezone || 'Asia/Kolkata',
      store_email: data.store_email || '',
      store_phone: data.store_phone || '',
    });
  } catch {
    return NextResponse.json({
      currency: 'INR',
      locale: 'en-IN',
      symbol: String.fromCharCode(8377),
      timezone: 'Asia/Kolkata',
    });
  }
}
