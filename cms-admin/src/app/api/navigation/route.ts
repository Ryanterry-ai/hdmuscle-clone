import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const navigations = await prisma.navigation.findMany({
      orderBy: { location: 'asc' },
    });
    return NextResponse.json({ navigations });
  } catch (error) {
    console.error('Error fetching navigations:', error);
    return NextResponse.json({ error: 'Failed to fetch navigations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    if (!session) return unauthorizedResponse();

    const body = await request.json();
    const { location } = body;
    
    const existing = await prisma.navigation.findUnique({ where: { location } });
    if (existing) {
      const navigation = await prisma.navigation.update({
        where: { location },
        data: { links: body.links, title: body.title, is_active: body.is_active },
      });
      return NextResponse.json(navigation);
    }

    const navigation = await prisma.navigation.create({ data: body });
    return NextResponse.json(navigation);
  } catch (error) {
    console.error('Error saving navigation:', error);
    return NextResponse.json({ error: 'Failed to save navigation' }, { status: 500 });
  }
}
