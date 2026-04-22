import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard-shell';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    redirect('/login?next=/dashboard');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
