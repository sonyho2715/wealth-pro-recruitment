import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CommissionsClient from './CommissionsClient';

export default async function CommissionsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  // Fetch commissions and prospects
  const [commissions, prospects] = await Promise.all([
    db.commission.findMany({
      where: { agentId: session.agentId },
      include: {
        prospect: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.prospect.findMany({
      where: { agentId: session.agentId },
      orderBy: [
        { firstName: 'asc' },
        { lastName: 'asc' },
      ],
    }),
  ]);

  return (
    <div className="p-6 lg:p-8">
      <CommissionsClient commissions={commissions} prospects={prospects} />
    </div>
  );
}
