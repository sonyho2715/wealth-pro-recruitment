import { redirect } from 'next/navigation';
import { getClientSession } from '@/lib/auth';
import ClientNavbar from './components/ClientNavbar';

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getClientSession();

  // Allow access to login page without auth
  // Other pages will handle their own auth checks

  return (
    <div className="min-h-screen bg-slate-50">
      {session.isLoggedIn && <ClientNavbar session={session} />}
      {children}
    </div>
  );
}
