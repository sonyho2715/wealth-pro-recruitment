import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MessagesClient from './MessagesClient';

export default async function MessagesPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    include: { organization: true },
  });

  // Fetch recent messages
  const messages = await db.message.findMany({
    where: { agentId: session.agentId },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          temperature: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  // Fetch contacts for quick send
  const contacts = await db.contact.findMany({
    where: {
      agentId: session.agentId,
      phone: { not: null },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      temperature: true,
    },
    orderBy: [
      { temperature: 'asc' },
      { lastName: 'asc' },
    ],
  });

  // Fetch scripts for templates
  const scripts = await db.script.findMany({
    where: {
      category: 'TEXT_TEMPLATE',
      isActive: true,
      OR: [
        { isSystem: true },
        { organizationId: agent?.organizationId || undefined },
        { createdById: session.agentId },
      ],
    },
    select: {
      id: true,
      title: true,
      content: true,
    },
    orderBy: { usageCount: 'desc' },
    take: 20,
  });

  const messagesData = messages.map(msg => ({
    id: msg.id,
    type: msg.type,
    direction: msg.direction,
    content: msg.content,
    recipientPhone: msg.recipientPhone,
    recipientName: msg.recipientName,
    status: msg.status,
    errorMessage: msg.errorMessage,
    sentAt: msg.sentAt?.toISOString() || null,
    deliveredAt: msg.deliveredAt?.toISOString() || null,
    createdAt: msg.createdAt.toISOString(),
    contact: msg.contact,
  }));

  // Group messages by contact/phone for conversations
  const conversationsMap = new Map<string, typeof messagesData>();
  messagesData.forEach(msg => {
    const key = msg.contact?.id || msg.recipientPhone || 'unknown';
    if (!conversationsMap.has(key)) {
      conversationsMap.set(key, []);
    }
    conversationsMap.get(key)!.push(msg);
  });

  const conversations = Array.from(conversationsMap.entries()).map(([key, msgs]) => ({
    id: key,
    contact: msgs[0].contact,
    recipientPhone: msgs[0].recipientPhone,
    recipientName: msgs[0].recipientName,
    lastMessage: msgs[0],
    messageCount: msgs.length,
  }));

  // Stats
  const stats = {
    totalSent: messages.filter(m => m.direction === 'OUTBOUND').length,
    totalReceived: messages.filter(m => m.direction === 'INBOUND').length,
    delivered: messages.filter(m => m.status === 'DELIVERED').length,
    failed: messages.filter(m => m.status === 'FAILED').length,
  };

  return (
    <div className="p-6 lg:p-8">
      <MessagesClient
        messages={messagesData}
        conversations={conversations}
        contacts={contacts}
        scripts={scripts}
        stats={stats}
        smsEnabled={agent?.organization?.smsEnabled || false}
      />
    </div>
  );
}
