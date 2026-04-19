import { NextResponse } from 'next/server';

const CMS_API = process.env.CMS_API || 'https://cms.hdmuscle.in/api';

export async function GET() {
  try {
    const res = await fetch(`${CMS_API}/collections`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ collections: [] }, { status: 500 });
  }
}