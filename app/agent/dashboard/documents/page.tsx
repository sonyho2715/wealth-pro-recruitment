import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DocumentsClient from './DocumentsClient';

export default async function DocumentsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  // Fetch all documents for this agent
  const documentsData = await db.document.findMany({
    where: { agentId: session.agentId },
    include: {
      prospect: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: { uploadedAt: 'desc' },
  });

  // Fetch all prospects for the upload modal
  const prospectsData = await db.prospect.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: { firstName: 'asc' },
  });

  // Transform data for client component
  const documents = documentsData.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    url: doc.url,
    size: doc.size || 0,
    uploadedAt: doc.uploadedAt,
    prospectId: doc.prospectId,
    prospect: doc.prospect,
  }));

  return <DocumentsClient documents={documents} prospects={prospectsData} />;
}
