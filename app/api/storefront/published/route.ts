import { NextResponse } from 'next/server';

const CMS_API = process.env.CMS_API || 'https://cms.hdmuscle.in/api';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch(`${CMS_API}/storefront/published`, {
      headers: { 
        'Content-Type': 'application/json'
      },
      next: { revalidate: 0 }
    });
    
    if (!res.ok) {
      console.error('CMS fetch failed:', res.status, res.statusText);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 502 });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('CMS fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}