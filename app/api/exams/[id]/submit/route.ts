import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase, getAuthFromCookies } from '@/lib/pocketbase';
import { ExamService } from '@/services/api';
import { ExamSubmission } from '@/types';
import { parseJWT } from '@/lib/jwt';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get auth from cookies
    const authData = request.headers.get('Authorization') || request.headers.get('pb_auth');
    if (!authData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const pb = getPocketBase();
    const decodeToken = parseJWT(authData || '');
                if (!decodeToken.id) {
                  // Access cookies if needed
                    return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
        
                //   router.push('/login?redirect=' + encodeURIComponent(`/exams/${examId}`));
                //   return;
                }
            
    const examId = params.id;
    const { userExamId, answers, timeSpent, clientTimeStamp } = await request.json() as ExamSubmission;
    
    // Verify the exam belongs to this user
    const userExam = await ExamService.getUserExam(userExamId);
    // if (userExam.user_id !== pb.authStore.model?.id) {
    //   return NextResponse.json({ error: 'Unauthorized access to this exam' }, { status: 403 });
    // }
    
    // Verify time validity
    const examStartTime = await ExamService.getExamStartTime(userExamId);
    const maxAllowedTime = await ExamService.getExamTimeLimit(examId);
    const actualTimeSpent = Math.min((Date.now() - examStartTime) / 1000, maxAllowedTime * 60);
    
    // Check for suspicious time discrepancy
    if (Math.abs(timeSpent - actualTimeSpent) > 60) { // 1 minute tolerance
      console.warn('Suspicious time discrepancy for exam:', examId, 'userExam:', userExamId);
      // Optionally flag for review or reject
    }
    
    // Calculate results
    const result = await ExamService.calculateExamResults(userExamId, examId, answers);
    
    // Save the exam result
    await ExamService.saveExamResult(userExamId, result.score, answers);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error submitting exam:', error);
    return NextResponse.json({ error: 'Failed to submit exam' }, { status: 500 });
  }
}