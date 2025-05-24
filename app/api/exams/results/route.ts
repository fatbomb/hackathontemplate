import { NextResponse } from 'next/server';
import { fetchResultsData } from '@/lib/api/result';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examId = searchParams.get('examId');
  
  try {
    const { exam, userExams, error } = await fetchResultsData(examId || undefined);
    console.log("Exam ID:", examId);
    
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
  } catch (error: unknown) {
    let errorMessage = 'Failed to load results';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}