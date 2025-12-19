'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

const moduleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  videoUrl: z.string().url().optional().or(z.literal('')),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  duration: z.number().optional(),
  category: z.enum([
    'ONBOARDING', 'PRODUCT_KNOWLEDGE', 'SALES_SKILLS',
    'COMPLIANCE', 'SYSTEM_TRAINING', 'RECRUITING', 'LEADERSHIP'
  ]),
  order: z.number().default(0),
  hasQuiz: z.boolean().default(false),
  quizQuestions: z.string().optional(),
  passingScore: z.number().min(0).max(100).default(70),
});

export async function createTrainingModule(formData: FormData) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if agent has admin/manager role
    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { role: true, organizationId: true },
    });

    if (agent?.role !== 'ADMIN' && agent?.role !== 'MANAGER') {
      return { success: false, error: 'Only managers can create training modules' };
    }

    const rawData = {
      title: formData.get('title'),
      description: formData.get('description') || undefined,
      content: formData.get('content'),
      videoUrl: formData.get('videoUrl') || undefined,
      thumbnailUrl: formData.get('thumbnailUrl') || undefined,
      duration: formData.get('duration') ? parseInt(formData.get('duration') as string) : undefined,
      category: formData.get('category'),
      order: formData.get('order') ? parseInt(formData.get('order') as string) : 0,
      hasQuiz: formData.get('hasQuiz') === 'true',
      quizQuestions: formData.get('quizQuestions') || undefined,
      passingScore: formData.get('passingScore') ? parseInt(formData.get('passingScore') as string) : 70,
    };

    const validated = moduleSchema.parse(rawData);

    const module = await db.trainingModule.create({
      data: {
        ...validated,
        videoUrl: validated.videoUrl || null,
        thumbnailUrl: validated.thumbnailUrl || null,
        organizationId: agent?.organizationId || null,
        quizQuestions: validated.quizQuestions ? JSON.parse(validated.quizQuestions) : null,
        isSystem: false,
      },
    });

    revalidatePath('/agent/dashboard/training');
    return { success: true, data: module };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input', details: error.errors };
    }
    console.error('Create training module error:', error);
    return { success: false, error: 'Failed to create training module' };
  }
}

export async function startModule(moduleId: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if completion record exists
    const existing = await db.trainingCompletion.findUnique({
      where: {
        moduleId_agentId: {
          moduleId,
          agentId: session.agentId,
        },
      },
    });

    if (existing) {
      return { success: true, data: existing };
    }

    // Create new completion record
    const completion = await db.trainingCompletion.create({
      data: {
        moduleId,
        agentId: session.agentId,
        status: 'IN_PROGRESS',
        progress: 0,
      },
    });

    revalidatePath('/agent/dashboard/training');
    return { success: true, data: completion };
  } catch (error) {
    console.error('Start module error:', error);
    return { success: false, error: 'Failed to start module' };
  }
}

export async function updateProgress(moduleId: string, progress: number) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const completion = await db.trainingCompletion.upsert({
      where: {
        moduleId_agentId: {
          moduleId,
          agentId: session.agentId,
        },
      },
      update: {
        progress: Math.min(100, progress),
        status: progress >= 100 ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: progress >= 100 ? new Date() : null,
      },
      create: {
        moduleId,
        agentId: session.agentId,
        status: 'IN_PROGRESS',
        progress: Math.min(100, progress),
      },
    });

    revalidatePath('/agent/dashboard/training');
    return { success: true, data: completion };
  } catch (error) {
    console.error('Update progress error:', error);
    return { success: false, error: 'Failed to update progress' };
  }
}

export async function completeModule(moduleId: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const module = await db.trainingModule.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      return { success: false, error: 'Module not found' };
    }

    // If module has quiz, can't complete without passing
    if (module.hasQuiz) {
      const completion = await db.trainingCompletion.findUnique({
        where: {
          moduleId_agentId: {
            moduleId,
            agentId: session.agentId,
          },
        },
      });

      if (!completion?.quizPassedAt) {
        return { success: false, error: 'Must pass quiz to complete this module' };
      }
    }

    const completion = await db.trainingCompletion.upsert({
      where: {
        moduleId_agentId: {
          moduleId,
          agentId: session.agentId,
        },
      },
      update: {
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
      create: {
        moduleId,
        agentId: session.agentId,
        status: 'COMPLETED',
        progress: 100,
        completedAt: new Date(),
      },
    });

    revalidatePath('/agent/dashboard/training');
    return { success: true, data: completion };
  } catch (error) {
    console.error('Complete module error:', error);
    return { success: false, error: 'Failed to complete module' };
  }
}

export async function submitQuiz(moduleId: string, answers: Record<string, number>) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const module = await db.trainingModule.findUnique({
      where: { id: moduleId },
    });

    if (!module || !module.hasQuiz || !module.quizQuestions) {
      return { success: false, error: 'Module has no quiz' };
    }

    // Calculate score
    const questions = module.quizQuestions as Array<{
      question: string;
      options: string[];
      correctAnswer: number;
    }>;

    let correct = 0;
    questions.forEach((q, index) => {
      if (answers[index.toString()] === q.correctAnswer) {
        correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= (module.passingScore || 70);

    // Update completion record
    const completion = await db.trainingCompletion.upsert({
      where: {
        moduleId_agentId: {
          moduleId,
          agentId: session.agentId,
        },
      },
      update: {
        quizScore: score,
        quizAttempts: { increment: 1 },
        quizPassedAt: passed ? new Date() : null,
        status: passed ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: passed ? new Date() : null,
        progress: passed ? 100 : 75,
      },
      create: {
        moduleId,
        agentId: session.agentId,
        status: passed ? 'COMPLETED' : 'IN_PROGRESS',
        progress: passed ? 100 : 75,
        quizScore: score,
        quizAttempts: 1,
        quizPassedAt: passed ? new Date() : null,
        completedAt: passed ? new Date() : null,
      },
    });

    revalidatePath('/agent/dashboard/training');
    return {
      success: true,
      data: {
        score,
        passed,
        correctCount: correct,
        totalQuestions: questions.length,
        passingScore: module.passingScore || 70,
      },
    };
  } catch (error) {
    console.error('Submit quiz error:', error);
    return { success: false, error: 'Failed to submit quiz' };
  }
}

export async function deleteTrainingModule(id: string) {
  try {
    const session = await getSession();
    if (!session?.agentId) {
      return { success: false, error: 'Unauthorized' };
    }

    const agent = await db.agent.findUnique({
      where: { id: session.agentId },
      select: { role: true },
    });

    if (agent?.role !== 'ADMIN') {
      return { success: false, error: 'Only admins can delete training modules' };
    }

    const module = await db.trainingModule.findUnique({
      where: { id },
    });

    if (!module) {
      return { success: false, error: 'Module not found' };
    }

    if (module.isSystem) {
      return { success: false, error: 'Cannot delete system modules' };
    }

    await db.trainingModule.delete({
      where: { id },
    });

    revalidatePath('/agent/dashboard/training');
    return { success: true };
  } catch (error) {
    console.error('Delete module error:', error);
    return { success: false, error: 'Failed to delete module' };
  }
}
