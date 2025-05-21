import { NextRequest, NextResponse } from 'next/server';
import { AIService, ExamService } from '@/services/api';
import { MCQGenerationParams } from '@/types';
import { getPocketBase, getCurrentUser } from '@/lib/pocketbase';

export async function POST(request: NextRequest) {
    try {
        const data: MCQGenerationParams = await request.json();
        const { refined_text, difficulty, num_questions, exam_name, time_limit, topic_name, language } = data;

        // Validate input
        if (!refined_text || !difficulty || !num_questions || !exam_name || !topic_name) {
            return NextResponse.json(
                { error: "All required fields must be provided" },
                { status: 400 }
            );
        }

        // Get authenticated user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized - Please log in" },
                { status: 401 }
            );
        }

        // Generate questions
        const aiRawResponse = await AIService.generateMCQQuestions({
            refined_text,
            difficulty,
            num_questions,
            topic_name,
            language,
        });

        const allGeneratedQuestions = AIService.processResponse(aiRawResponse, num_questions);
        
        if (allGeneratedQuestions.length === 0) {
            return NextResponse.json(
                { error: "Failed to generate valid questions" },
                { status: 500 }
            );
        }

        const pb = await getPocketBase();

        // Create exam in transaction
        try {
            // Create exam
            const newExam = await pb.collection('exams').create({
                user_id: user.id,
                exam_name: exam_name,
                input_text: refined_text,
                difficulty: difficulty.toLowerCase(),
                topic: topic_name,
                type: 'mcq',
                time_limit: time_limit,
            });

            // Create questions
            const questionsCreation = allGeneratedQuestions.map(q => 
                pb.collection('questions').create({
                    exam_id: newExam.id,
                    question_statement: q.question,
                    options: q.options,
                    correct_answer: q.answer,
                    explaination: q.explanation
                })
            );

            await Promise.all(questionsCreation);

            // Create user exam relation
            const newUserExam = await pb.collection('user_exams').create({
                user_id: user.id,
                exam_id: newExam.id,
                status: 'pending'
            });

            return NextResponse.json({
                message: "Exam created successfully",
                exam_id: newExam.id,
                user_exam_id: newUserExam.id,
                questions_count: allGeneratedQuestions.length
            });

        } catch (error) {
            console.error('Database operation failed:', error);
            return NextResponse.json(
                { error: "Failed to save exam data" },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('MCQ generation error:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}