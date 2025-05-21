import { getPocketBase } from '@/lib/pocketbase';
import { cookies } from 'next/headers';

export async function fetchExamData(examId: string, userExamId?: string) {
  try {
    const cookieStore = await cookies();
    const pb = await getPocketBase(cookieStore.toString());

    if (!pb.authStore.isValid) {
      try {
        await pb.collection('users').authRefresh();
      } catch {
        return { error: 'Session expired' };
      }
    }

    // Verify user owns this exam
    const exam = await pb.collection('exams').getOne(examId);
    if (exam.user_id !== pb.authStore.model?.id) {
      return { error: 'Unauthorized access to this exam' };
    }
    console.log(`user="${pb.authStore.model?.id}" && exam="${examId}" && status="completed"`);


    // Get questions (filter out correct answers for client)
    const questions = await pb.collection('questions').getFullList({
      filter: `exam_id = "${examId}"`
    });

    return {
      exam: {
        id: exam.id,
        exam_name: exam.exam_name,
        difficulty: exam.difficulty,
        time_limit: exam.time_limit,
        questions: questions.map(q => ({
          id: q.id,
          question_statement: q.question_statement,
          options: q.options,
          explanation: q.explaination
        }))
      },
      error: null
    };
  } catch (error: any) {
    console.error('Error fetching exam:', error);
    return {
      exam: null,
      error: error.message || 'Failed to load exam'
    };
  }
}
export async function initExamSession(examId: string, existingUserExamId?: string) {
  try {
    const cookieStore = await cookies();
    const pb = await getPocketBase(cookieStore.toString());

    if (!pb.authStore.isValid) {
      try {
        await pb.collection('users').authRefresh();
      } catch {
        return { error: 'Session expired' };
      }
    }

    const userId = pb.authStore.model?.id;
    if (!userId) {
      return { error: 'User not authenticated' };
    }

    // Verify existing user exam if provided
    if (existingUserExamId) {
      const userExam = await pb.collection('user_exams').getOne(existingUserExamId);
      if (userExam.user_id !== userId) {
        return { error: 'This exam does not belong to you' };
      }
      if (userExam.status !== 'completed') {
        return { userExamId: existingUserExamId, error: null };
      }
    }

    // Create new exam session
    const newUserExam = await pb.collection('user_exams').create({
      user_id: userId,
      exam_id: examId,
      status: 'pending'
    });

    return {
      userExamId: newUserExam.id,
      error: null
    };
  } catch (error: any) {
    console.error('Exam initialization error:', error);
    return {
      userExamId: null,
      error: error.message || 'Failed to initialize exam'
    };
  }
}