import { NextResponse } from 'next/server';

const CMS_API = process.env.CMS_API || 'https://cms.hdmuscle.in/api';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  
  try {
    const res = await fetch(`${CMS_API}/products?${query}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ products: [], total: 0, error: 'Failed to fetch products' }, { status: 500 });
  }
}