import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import TrainingClient from './TrainingClient';

export default async function TrainingPage() {
  const session = await getSession();
  if (!session.agentId) redirect('/agent/login');

  const agent = await db.agent.findUnique({
    where: { id: session.agentId },
    select: { organizationId: true, role: true },
  });

  // Fetch training modules
  const modules = await db.trainingModule.findMany({
    where: {
      isActive: true,
      OR: [
        { isSystem: true },
        { organizationId: agent?.organizationId || undefined },
      ],
    },
    include: {
      completions: {
        where: { agentId: session.agentId },
      },
    },
    orderBy: [
      { category: 'asc' },
      { order: 'asc' },
    ],
  });

  const modulesData = modules.map(module => ({
    id: module.id,
    title: module.title,
    description: module.description,
    content: module.content,
    videoUrl: module.videoUrl,
    thumbnailUrl: module.thumbnailUrl,
    duration: module.duration,
    category: module.category,
    order: module.order,
    hasQuiz: module.hasQuiz,
    quizQuestions: module.quizQuestions as Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }> | null,
    passingScore: module.passingScore,
    isSystem: module.isSystem,
    completion: module.completions[0] ? {
      status: module.completions[0].status,
      progress: module.completions[0].progress,
      quizScore: module.completions[0].quizScore,
      quizAttempts: module.completions[0].quizAttempts,
      completedAt: module.completions[0].completedAt?.toISOString() || null,
    } : null,
    createdAt: module.createdAt.toISOString(),
  }));

  // Calculate stats
  const stats = {
    totalModules: modules.length,
    completed: modules.filter(m => m.completions[0]?.status === 'COMPLETED').length,
    inProgress: modules.filter(m => m.completions[0]?.status === 'IN_PROGRESS').length,
    notStarted: modules.filter(m => !m.completions[0]).length,
    totalDuration: modules.reduce((sum, m) => sum + (m.duration || 0), 0),
    completedDuration: modules
      .filter(m => m.completions[0]?.status === 'COMPLETED')
      .reduce((sum, m) => sum + (m.duration || 0), 0),
  };

  const overallProgress = stats.totalModules > 0
    ? Math.round((stats.completed / stats.totalModules) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8">
      <TrainingClient
        modules={modulesData}
        stats={stats}
        overallProgress={overallProgress}
        isManager={agent?.role === 'ADMIN' || agent?.role === 'MANAGER'}
      />
    </div>
  );
}
