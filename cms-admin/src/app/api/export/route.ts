import { NextRequest } from 'next/server';
import { requireSession, unauthorizedResponse } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await requireSession(request);
  if (!session) return unauthorizedResponse();

  return new Response('Export API ready');
}
