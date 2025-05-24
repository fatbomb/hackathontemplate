import { NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase';

export async function POST(request: Request) {
  try {
    const { examId } = await request.json();
    const pb = await getPocketBase(request.headers.get('cookie') || '');
    
    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 401 }
      );
    }

    const userId = pb.authStore.model?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const newUserExam = await pb.collection('user_exams').create({
      user_id: userId,
      exam_id: examId,
      status: 'pending'
    }) as { id: string };

    return NextResponse.json({
      userExamId: newUserExam.id
    });

  } catch (error: unknown) {
    let errorMessage = 'Failed to initialize exam';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}