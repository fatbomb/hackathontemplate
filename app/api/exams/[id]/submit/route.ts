import { NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pb = await getPocketBase(request.headers.get('cookie') || '');
    
    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userExamId, answers, timeSpent, clientTimeStamp } = await request.json();
    
    // Verify the exam belongs to this user
    const userExam = await pb.collection('user_exams').getOne(userExamId);
    if (userExam.user_id !== pb.authStore.model?.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to this exam' },
        { status: 403 }
      );
    }

    // Calculate results
    const questions = await pb.collection('questions').getFullList({
      filter: `exam_id = "${params.id}"`
    });

    let correctCount = 0;
    const questionResults = questions.map((question, index) => {
      const userAnswer = answers[index]?.selectedAnswer;
      const isCorrect = Number(userAnswer) === Number(question.correct_answer);
      if (isCorrect) correctCount++;
      return {
        id: question.id,
        correctAnswer: question.correct_answer,
        userAnswer,
        isCorrect,
        explanation: question.explaination
      };
    });
      

    const score = (correctCount / questions.length) * 100;
    
    // Save the result
    await pb.collection('user_exams').update(userExamId, {
      status: 'completed',
      score,
      answers: answers,
      completed_at: new Date().toISOString(),
      time_spent: timeSpent
    });

    return NextResponse.json({
      score,
      questions: questionResults
    });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit exam' },
      { status: 500 }
    );
  }
}