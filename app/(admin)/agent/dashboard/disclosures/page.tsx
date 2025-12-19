import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DisclosuresClient from './DisclosuresClient';

export default async function DisclosuresPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { organizationId: true },
  });

  // Fetch disclosures
  const disclosures = await db.disclosure.findMany({
    where: {
      OR: [
        { organizationId: agent?.organizationId },
        { organizationId: null },
      ],
    },
    include: {
      _count: {
        select: { signatures: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch prospects for sending disclosures
  const prospects = await db.prospect.findMany({
    where: {
      OR: [
        { agentId: session.agentId },
        { agentId: null },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  });

  // Get recent signatures
  const recentSignatures = await db.disclosureSignature.findMany({
    where: {
      disclosure: {
        OR: [
          { organizationId: agent?.organizationId },
          { organizationId: null },
        ],
      },
    },
    include: {
      disclosure: {
        select: {
          title: true,
          requiredFor: true,
        },
      },
    },
    orderBy: { signedAt: 'desc' },
    take: 20,
  });

  const disclosuresData = disclosures.map(d => ({
    id: d.id,
    title: d.title,
    description: d.description,
    requiredFor: d.requiredFor,
    content: d.content,
    requiresSignature: d.requiresSignature,
    isActive: d.isActive,
    version: d.version,
    signatureCount: d._count.signatures,
    createdAt: d.createdAt.toISOString(),
  }));

  const prospectsData = prospects.map(p => ({
    id: p.id,
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    phone: p.phone,
  }));

  const signaturesData = recentSignatures.map(s => ({
    id: s.id,
    disclosureTitle: s.disclosure.title,
    requiredFor: s.disclosure.requiredFor,
    signerName: s.signerName,
    signerEmail: s.signerEmail,
    signedAt: s.signedAt.toISOString(),
    version: s.disclosureVersion,
  }));

  // Stats
  const stats = {
    total: disclosures.length,
    active: disclosures.filter(d => d.isActive).length,
    totalSignatures: disclosures.reduce((sum, d) => sum + d._count.signatures, 0),
    thisWeek: recentSignatures.filter(s => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return s.signedAt > weekAgo;
    }).length,
  };

  return (
    <div className="p-6 lg:p-8">
      <DisclosuresClient
        disclosures={disclosuresData}
        prospects={prospectsData}
        recentSignatures={signaturesData}
        stats={stats}
      />
    </div>
  );
}
