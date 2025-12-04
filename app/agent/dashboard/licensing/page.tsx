import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import LicensingClient from './LicensingClient';

export default async function LicensingPage() {
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

  // Fetch all recruits for licensing tracking
  const recruits = await db.recruit.findMany({
    where: {
      organizationId: agent.organizationId,
      // Only show recruits that are actively working on licensing
      status: {
        in: ['ACTIVE', 'FAST_START_COMPLETE'],
      },
    },
    include: {
      recruiter: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: [
      { licenseIssued: 'asc' }, // Non-licensed first
      { hoursCompleted: 'desc' }, // Most hours first
    ],
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
    codeExpiryDate: recruit.codeExpiryDate?.toISOString() || null,
    hoursCompleted: recruit.hoursCompleted,
    examPassed: recruit.examPassed,
    examPassedDate: recruit.examPassedDate?.toISOString() || null,
    fingerprinting: recruit.fingerprinting,
    fingerprintDate: recruit.fingerprintDate?.toISOString() || null,
    licenseIssued: recruit.licenseIssued,
    licenseIssuedDate: recruit.licenseIssuedDate?.toISOString() || null,
    notes: recruit.notes,
    recruiter: recruit.recruiter,
  }));

  return (
    <div className="p-6 lg:p-8">
      <LicensingClient recruits={recruitsData} />
    </div>
  );
}
