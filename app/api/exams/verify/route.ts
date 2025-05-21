import { NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userExamId = searchParams.get('userExamId');
    console.log('userExamId', userExamId);
    
    if (!userExamId) {
      return NextResponse.json(
        { error: 'userExamId is required' },
        { status: 400 }
      );
    }

    const pb = await getPocketBase(request.headers.get('cookie') || '');
    
    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const userExam = await pb.collection('user_exams').getOne(userExamId);
    
    if (userExam.user_id !== pb.authStore.model?.id) {
      return NextResponse.json(
        { error: 'Exam does not belong to user' },
        { status: 403 }
      );
    }

    return NextResponse.json({ valid: true });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}