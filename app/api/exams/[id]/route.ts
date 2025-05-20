import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase, getAuthFromCookies } from '@/lib/pocketbase';
import { ExamService } from '@/services/api';
import { parseJWT } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth from cookies
    const authData = request.headers.get('Authorization') || request.headers.get('pb_auth');
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // let token: string;
    // let model: any;
    // try {
    //   const parsed = JSON.parse(authData);
    //   token = parsed.token;
    //   model = parsed.model;
    // } catch {
    //   return NextResponse.json({ error: 'Invalid authentication data' }, { status: 401 });
    // }

    // const pb = getPocketBase();
    // pb.authStore.save(token, model);
    
    // if (!pb.authStore.isValid) {
    //   return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    // }
    const decodeToken = parseJWT(authData || '');
            if (!decodeToken.id) {
              // Access cookies if needed
                return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    
            //   router.push('/login?redirect=' + encodeURIComponent(`/exams/${examId}`));
            //   return;
            }
    
    const examId = params.id;
    
    // Get query params
    const url = new URL(request.url);
    const userExamId = url.searchParams.get('userExamId');
    
    if (!userExamId) {
      return NextResponse.json({ error: 'User exam ID is required' }, { status: 400 });
    }
    
    // Get exam details
    const exam = await ExamService.getExam(examId);
    
    // Get questions but filter out correct answers
    const clientQuestions = await ExamService.getClientQuestions(examId);
    
    // Mark exam as started
    await ExamService.startExam(userExamId);
    
    return NextResponse.json({ 
      exam: {
        ...exam,
        questions: clientQuestions
      },
      userExamId
    });
    
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json({ error: 'Failed to load exam' }, { status: 500 });
  }
}