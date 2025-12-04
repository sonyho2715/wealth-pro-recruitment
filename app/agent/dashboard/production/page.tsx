import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProductionClient from './ProductionClient';

export default async function ProductionPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { organizationId: true },
  });

  if (!agent?.organizationId) {
    return (
      <div className="p-6 lg:p-8">
        <div className="card-gradient text-center py-12">
          <p className="text-gray-500">No organization found. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Fetch all production for this organization
  const productions = await db.production.findMany({
    where: { organizationId: agent.organizationId },
    include: {
      writingAgent: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      trainee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { writtenDate: 'desc' },
  });

  // Fetch agents for dropdown
  const agents = await db.agent.findMany({
    where: { organizationId: agent.organizationId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: { firstName: 'asc' },
  });

  // Fetch recruits for trainee dropdown
  const recruits = await db.recruit.findMany({
    where: { organizationId: agent.organizationId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: { firstName: 'asc' },
  });

  // Transform data for client component
  const productionsData = productions.map(prod => ({
    id: prod.id,
    clientName: prod.clientName,
    clientPhone: prod.clientPhone,
    clientEmail: prod.clientEmail,
    provider: prod.provider,
    product: prod.product,
    productType: prod.productType,
    policyNumber: prod.policyNumber,
    description: prod.description,
    totalPoints: Number(prod.totalPoints),
    baseshopPoints: Number(prod.baseshopPoints),
    premium: prod.premium ? Number(prod.premium) : null,
    splitRatio: prod.splitRatio,
    writtenDate: prod.writtenDate.toISOString(),
    dropDate: prod.dropDate?.toISOString() || null,
    status: prod.status,
    advPaid: prod.advPaid,
    pd1Paid: prod.pd1Paid,
    pd2Paid: prod.pd2Paid,
    isTrainee: prod.isTrainee,
    notes: prod.notes,
    writingAgent: prod.writingAgent,
    trainee: prod.trainee,
  }));

  // Calculate stats
  const stats = {
    totalProduction: productions.length,
    totalPoints: productions.reduce((sum, p) => sum + Number(p.totalPoints), 0),
    baseshopPoints: productions.reduce((sum, p) => sum + Number(p.baseshopPoints), 0),
    pending: productions.filter(p => p.status === 'PENDING' || p.status === 'SUBMITTED').length,
    approved: productions.filter(p => p.status === 'APPROVED' || p.status === 'ISSUED').length,
    paid: productions.filter(p => p.status === 'PAID').length,
  };

  return (
    <div className="p-6 lg:p-8">
      <ProductionClient
        productions={productionsData}
        agents={agents}
        recruits={recruits}
        stats={stats}
        currentAgentId={session.agentId}
      />
    </div>
  );
}
