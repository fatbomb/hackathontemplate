import { NextRequest, NextResponse } from 'next/server';
import { AIService, ExamService } from '@/services/api';
import { MCQGenerationParams } from '@/types';
import { cookies } from 'next/headers';
import { getPocketBase, getAuthFromCookies } from '@/lib/pocketbase';
import { parseJWT } from '@/lib/jwt';
export async function POST(request: NextRequest) {
  try {
    const data: MCQGenerationParams = await request.json();
    const { refined_text, difficulty, num_questions, exam_name, time_limit, topic_name, language } = data;

    // Validate input data
    if (!refined_text || !difficulty || !num_questions || !exam_name || !topic_name) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    
    // Get auth token from cookies
    const authToken = getAuthFromCookies(request.headers.get('cookie') || '');
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize PocketBase
    const pb = getPocketBase();
    pb.authStore.loadFromCookie(`pb_auth=${authToken}`);
    // console.log('Auth store:', pb.authStore, authToken);
    // console.log('Decoded Token:', parseJWT(authToken)); // Use a function to decode JWT

    const decodededToken = parseJWT(authToken);
    console.log('Decoded Token:', decodededToken.id);
    
    // Ensure the auth store is valid
    if (!decodededToken.id) {
      return NextResponse.json({ error: 'Invalid authentication or user not found' }, { status: 401 });
    }
    
    const userId = decodededToken.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 500 });
    }

    // Proceed with MCQ generation logic
    const aiRawResponse = await AIService.generateMCQQuestions({
      refined_text,
      difficulty,
      num_questions,
      topic_name,
      language,
    });

    const allGeneratedQuestions = AIService.processResponse(aiRawResponse, num_questions);
    
    if (allGeneratedQuestions.length === 0) {
      return NextResponse.json({ error: 'Failed to generate valid questions' }, { status: 500 });
    }

    try {
      // --- Create exam ---
      const newExam = await pb.collection('exams').create({
        user_id: userId,
        exam_name: exam_name,
        input_text: refined_text,
        difficulty: difficulty.toLowerCase(),
        topic: topic_name,
        type: 'mcq',
        time_limit: time_limit,
      });

      // --- Save questions ---
      for (const q of allGeneratedQuestions) {
        await pb.collection('questions').create({
          exam_id: newExam.id,
          question_statement: q.question,
          options: q.options,
          correct_answer: q.answer,
          explaination: q.explanation
        });
      }

      // --- Assign to user ---
      const newUserExam = await pb.collection('user_exams').create({
        user_id: userId,
        exam_id: newExam.id,
        status: 'pending'
      });
      
      return NextResponse.json({
        message: "Exam and questions saved successfully!",
        exam_id: newExam.id,
        user_exam_id: newUserExam.id
      });

    } catch (error) {
      console.error('MCQ generation error:', error);
      return NextResponse.json({ error: 'MCQ creation failed' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in MCQ generation:', error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}