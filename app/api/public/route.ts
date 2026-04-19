import { NextResponse } from 'next/server';

const CMS_API = process.env.CMS_API || 'https://cms.hdmuscle.in/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'products';
  const params = searchParams.toString().replace('type=', '');
  
  try {
    const res = await fetch(`${CMS_API}/${type}?${params}`, {
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': 'md_session=public'
      }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'CMS unavailable' }, { status: 502 });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}