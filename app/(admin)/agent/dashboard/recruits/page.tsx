import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RecruitsClient from './RecruitsClient';

export default async function RecruitsPage() {
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

  // Fetch all recruits for this organization
  const recruits = await db.recruit.findMany({
    where: { organizationId: agent.organizationId },
    include: {
      recruiter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      fieldTrainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { startDate: 'desc' },
  });

  // Fetch agents for the field trainer dropdown
  const agents = await db.agent.findMany({
    where: { organizationId: agent.organizationId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: { firstName: 'asc' },
  });

  // Transform data for client component
  const recruitsData = recruits.map(recruit => ({
    id: recruit.id,
    firstName: recruit.firstName,
    lastName: recruit.lastName,
    phone: recruit.phone,
    email: recruit.email,
    codeNumber: recruit.codeNumber,
    state: recruit.state,
    status: recruit.status,
    startDate: recruit.startDate.toISOString(),
    meetSpouse: recruit.meetSpouse,
    meetSpouseDate: recruit.meetSpouseDate?.toISOString() || null,
    submitLic: recruit.submitLic,
    submitLicDate: recruit.submitLicDate?.toISOString() || null,
    prospectList: recruit.prospectList,
    prospectListDate: recruit.prospectListDate?.toISOString() || null,
    threeThreeThirty: recruit.threeThreeThirty,
    threeThreeThirtyDate: recruit.threeThreeThirtyDate?.toISOString() || null,
    fna: recruit.fna,
    fnaDate: recruit.fnaDate?.toISOString() || null,
    fastStartSchool: recruit.fastStartSchool,
    fastStartSchoolDate: recruit.fastStartSchoolDate?.toISOString() || null,
    codeExpiryDate: recruit.codeExpiryDate?.toISOString() || null,
    hoursCompleted: recruit.hoursCompleted,
    examPassed: recruit.examPassed,
    fingerprinting: recruit.fingerprinting,
    licenseIssued: recruit.licenseIssued,
    notes: recruit.notes,
    recruiter: recruit.recruiter,
    fieldTrainer: recruit.fieldTrainer,
  }));

  // Calculate stats
  const stats = {
    total: recruits.length,
    active: recruits.filter(r => r.status === 'ACTIVE').length,
    licensed: recruits.filter(r => r.status === 'LICENSED').length,
    inactive: recruits.filter(r => r.status === 'INACTIVE' || r.status === 'NOT_INTERESTED').length,
    fastStartComplete: recruits.filter(r => r.status === 'FAST_START_COMPLETE').length,
  };

  return (
    <div className="p-6 lg:p-8">
      <RecruitsClient
        recruits={recruitsData}
        agents={agents}
        stats={stats}
        currentAgentId={session.agentId}
      />
    </div>
  );
}
