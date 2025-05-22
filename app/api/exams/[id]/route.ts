import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase, getCurrentUser } from '@/lib/pocketbase';
import { ExamService } from '@/services/api';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const examId = params.id;
        const url = new URL(request.url);
        const userExamId = url.searchParams.get('userExamId');

        if (!userExamId) {
            return NextResponse.json(
                { error: 'User exam ID is required' },
                { status: 400 }
            );
        }

        // Verify user owns this exam
        const pb = await getPocketBase();
        const userExam = await pb.collection('user_exams').getOne(userExamId);
        
        if (userExam.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized access to this exam' },
                { status: 403 }
            );
        }

        // Get exam details
        const exam = await ExamService.getExam(examId);
        const clientQuestions = await ExamService.getClientQuestions(examId);
        
        // Mark as started if not already
        if (userExam.status !== 'completed') {
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
            { error: 'Failed to load exam' },
            { status: 500 }
        );
    }
}