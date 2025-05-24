import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase, getCurrentUser } from '@/lib/pocketbase';
import { ExamService } from '@/services/api';

interface UserExam {
  id: string;
  user_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  started_at?: string;
}

export async function GET(
  request: NextRequest,
  {params}: { params: Promise< { id: string }> }
): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const examId = id;
    const url = new URL(request.url);
    const userExamId = url.searchParams.get('userExamId');

    if (!userExamId) {
      return NextResponse.json(
        { error: 'User exam ID is required' },
        { status: 400 }
      );
    }

    const pb = await getPocketBase();
    const userExam: UserExam = await pb.collection('user_exams').getOne(userExamId);
    
    if (userExam.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this exam' },
        { status: 403 }
      );
    }

    const [exam, clientQuestions] = await Promise.all([
      ExamService.getExam(examId),
      ExamService.getClientQuestions(examId)
    ]);

    if (userExam.status === 'not_started') {
      await pb.collection('user_exams').update(userExamId, {
        status: 'in_progress',
        started_at: new Date().toISOString()
      });
    }

    return NextResponse.json({
      exam: {
        ...exam,
        questions: clientQuestions
      },
      userExamId
    });

  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load exam' },
      { status: 500 }
    );
  }
}