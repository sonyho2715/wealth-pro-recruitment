import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import SigningView from './SigningView';

interface PageProps {
  params: Promise<{ token: string }>;
}

interface SigningData {
  prospectId: string;
  disclosureIds: string[];
  agentId: string;
  token: string;
  expiresAt: string;
}

export default async function SignPage({ params }: PageProps) {
  const { token } = await params;

  // Decode the token
  let signingData: SigningData;
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    signingData = JSON.parse(decoded);
  } catch {
    notFound();
  }

  // Check if expired
  if (new Date(signingData.expiresAt) < new Date()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600">
            This signing link has expired. Please contact your financial professional for a new link.
          </p>
        </div>
      </div>
    );
  }

  // Fetch prospect
  const prospect = await db.prospect.findUnique({
    where: { id: signingData.prospectId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!prospect) {
    notFound();
  }

  // Fetch disclosures
  const disclosures = await db.disclosure.findMany({
    where: {
      id: { in: signingData.disclosureIds },
      isActive: true,
    },
  });

  if (disclosures.length === 0) {
    notFound();
  }

  // Check which ones are already signed
  const existingSignatures = await db.disclosureSignature.findMany({
    where: {
      signerId: prospect.id,
      signerType: 'PROSPECT',
      disclosureId: { in: disclosures.map(d => d.id) },
    },
    select: {
      disclosureId: true,
      disclosureVersion: true,
    },
  });

  const signedMap = new Map(existingSignatures.map(s => [`${s.disclosureId}-${s.disclosureVersion}`, true]));

  // Filter to only pending disclosures (not signed or new version)
  const pendingDisclosures = disclosures.filter(d => !signedMap.has(`${d.id}-${d.version}`));

  // Fetch agent info
  const agent = await db.agent.findUnique({
    where: { id: signingData.agentId },
    select: {
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    },
  });

  const disclosuresData = pendingDisclosures.map(d => ({
    id: d.id,
    title: d.title,
    requiredFor: d.requiredFor,
    content: d.content,
    requiresSignature: d.requiresSignature,
    version: d.version,
  }));

  const alreadySignedCount = disclosures.length - pendingDisclosures.length;

  return (
    <SigningView
      prospect={{
        id: prospect.id,
        firstName: prospect.firstName,
        lastName: prospect.lastName,
      }}
      agent={agent}
      disclosures={disclosuresData}
      alreadySignedCount={alreadySignedCount}
    />
  );
}
