import { NextResponse } from 'next/server';
import { getCmsApiBaseUrl } from '../../lib/site-config';

const CMS_API = getCmsApiBaseUrl();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'products';
  const params = new URLSearchParams(searchParams);
  params.delete('type');
  
  try {
    const query = params.toString();
    const res = await fetch(`${CMS_API}/${type}${query ? `?${query}` : ''}`, {
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
