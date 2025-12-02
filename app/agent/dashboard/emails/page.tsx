import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import EmailsClient from './EmailsClient';
import { DEFAULT_EMAIL_TEMPLATES } from './templates';

export const metadata = {
  title: 'Email Templates | Agent Dashboard',
  description: 'Pre-written email templates for common scenarios',
};

export default async function EmailsPage() {
  const session = await getSession();

  if (!session.isLoggedIn || session.role !== 'agent' || !session.agentId) {
    redirect('/agent/login');
  }

  // Get agent info
  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: {
      firstName: true,
      lastName: true,
    },
  });

  const agentName = agent ? `${agent.firstName} ${agent.lastName}` : 'Agent';

  // Get templates (global, not per-agent)
  let templates = await db.emailTemplate.findMany({
    orderBy: [
      { category: 'asc' },
      { name: 'asc' },
    ],
  });

  // If no templates exist, seed default templates
  if (templates.length === 0) {
    const createdTemplates = await Promise.all(
      DEFAULT_EMAIL_TEMPLATES.map(template =>
        db.emailTemplate.create({
          data: {
            name: template.name,
            subject: template.subject,
            body: template.body,
            category: template.category,
            isActive: true,
          },
        })
      )
    );

    templates = createdTemplates;
  }

  // Get prospects for email dropdown
  const prospectsWithProfile = await db.prospect.findMany({
    include: {
      financialProfile: {
        select: {
          protectionGap: true,
        },
      },
    },
    orderBy: {
      firstName: 'asc',
    },
  });

  // Transform prospects to include protectionGap at top level
  const prospects = prospectsWithProfile.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    protectionGap: p.financialProfile ? Number(p.financialProfile.protectionGap) : 0,
  }));

  return (
    <EmailsClient
      initialTemplates={templates}
      prospects={prospects}
      agentName={agentName}
    />
  );
}
