import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ContactsClient from './ContactsClient';

export default async function ContactsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  // Fetch all contacts for this agent
  const contacts = await db.contact.findMany({
    where: { agentId: session.agentId },
    include: {
      prospect: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      },
      referredBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      referrals: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [
      { temperature: 'asc' },
      { nextFollowUpAt: 'asc' },
      { createdAt: 'desc' },
    ],
  });

  // Transform data for client component
  const contactsData = contacts.map(contact => ({
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone,
    email: contact.email,
    relationship: contact.relationship,
    temperature: contact.temperature,
    source: contact.source,
    notes: contact.notes,
    tags: contact.tags,
    birthday: contact.birthday?.toISOString() || null,
    occupation: contact.occupation,
    company: contact.company,
    lastContactedAt: contact.lastContactedAt?.toISOString() || null,
    nextFollowUpAt: contact.nextFollowUpAt?.toISOString() || null,
    followUpNotes: contact.followUpNotes,
    createdAt: contact.createdAt.toISOString(),
    prospect: contact.prospect,
    referredBy: contact.referredBy,
    referrals: contact.referrals,
  }));

  // Get summary stats
  const stats = {
    total: contacts.length,
    cold: contacts.filter(c => c.temperature === 'COLD').length,
    warming: contacts.filter(c => c.temperature === 'WARMING').length,
    warm: contacts.filter(c => c.temperature === 'WARM').length,
    hot: contacts.filter(c => c.temperature === 'HOT').length,
    converted: contacts.filter(c => c.temperature === 'CONVERTED').length,
    followUpsToday: contacts.filter(c => {
      if (!c.nextFollowUpAt) return false;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const followUp = new Date(c.nextFollowUpAt);
      followUp.setHours(0, 0, 0, 0);
      return followUp.getTime() === today.getTime();
    }).length,
  };

  return (
    <div className="p-6 lg:p-8">
      <ContactsClient contacts={contactsData} stats={stats} />
    </div>
  );
}
