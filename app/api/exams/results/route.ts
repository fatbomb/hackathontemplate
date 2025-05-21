import { NextResponse } from 'next/server';
import { fetchResultsData } from '@/lib/api/result';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');
  
  try {
    const { exam, userExams, error } = await fetchResultsData(examId || undefined);
    
    if (error) {
      return NextResponse.json(
        { error },
        { status: error === 'Exam ID is required' ? 400 : 401 }
      );
    }

    return NextResponse.json({
      exam,
      userExams
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load results' },
      { status: 500 }
    );
  }
}