import { NextResponse } from 'next/server';
import { fetchExamsData } from '@/lib/api/exams';

export async function GET() {
  try {
    const { exams, userExams, error } = await fetchExamsData();
    
    if (error) {
      return NextResponse.json(
        { error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      exams,
      userExams
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load exams' },
      { status: 500 }
    );
  }
}