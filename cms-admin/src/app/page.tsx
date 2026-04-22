import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (session) {
    redirect('/dashboard');
  }

  redirect('/login');
}
