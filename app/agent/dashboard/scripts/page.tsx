import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ScriptsClient from './ScriptsClient';

export default async function ScriptsPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { organizationId: true },
  });

  // Fetch scripts: system scripts + org scripts + personal scripts
  const scripts = await db.script.findMany({
    where: {
      isActive: true,
      OR: [
        { isSystem: true },
        { organizationId: agent?.organizationId || undefined },
        { createdById: session.agentId },
      ],
    },
    orderBy: [
      { category: 'asc' },
      { usageCount: 'desc' },
      { title: 'asc' },
    ],
  });

  const scriptsData = scripts.map(script => ({
    id: script.id,
    title: script.title,
    description: script.description,
    content: script.content,
    category: script.category,
    tags: script.tags,
    isSystem: script.isSystem,
    usageCount: script.usageCount,
    lastUsedAt: script.lastUsedAt?.toISOString() || null,
    createdById: script.createdById,
    createdAt: script.createdAt.toISOString(),
  }));

  // Get category counts
  const categoryCounts = scripts.reduce((acc, script) => {
    acc[script.category] = (acc[script.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 lg:p-8">
      <ScriptsClient
        scripts={scriptsData}
        categoryCounts={categoryCounts}
        currentAgentId={session.agentId}
      />
    </div>
  );
}
