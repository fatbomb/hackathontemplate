import { NextRequest, NextResponse } from 'next/server';
import { AIService, ExamService } from '@/services/api';
import { MCQGenerationParams } from '@/types';
import { getPocketBase, getCurrentUser } from '@/lib/pocketbase';

export async function POST(request: NextRequest) {
    try {
        const data: MCQGenerationParams = await request.json();
        const { refined_text, difficulty, num_questions, exam_name, time_limit, topic_name, language, subject, Class } = data;

        // Validate input
        if (!difficulty || !num_questions || !exam_name || !topic_name) {
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
            subject,
            Class
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
                subject: subject,
            });
            let subjectRecord;
            try {
                const subjectRecords = await pb.collection('subjects').getList(1, 1, {
                    filter: `title="${subject}"`
                });
                subjectRecord = subjectRecords.items[0];
            } catch (error) {
                // Subject not found, create it
                subjectRecord = await pb.collection('subjects').create({
                    title: subject
                });
            }
            let topicRecord;
            try {
                const topicRecords = await pb.collection('topics').getList(1, 1, {
                    filter: `title="${topic_name}" && subject="${subjectRecord.id}"`
                });
                topicRecord = topicRecords.items[0];
            } catch (error) {
                // Topic not found, create it
                topicRecord = await pb.collection('topics').create({
                    title: topic_name,
                    subject: subjectRecord.id
                });
            }
            // Check if a record exists for the subject and topic
            // Alternative approach using getList()
            const records = await pb.collection('game_points').getList(1, 1, {
                filter: `topic="${topicRecord.id}" && user="${user.id}" && type="gymnasium"`,
                expand: 'user,topic'
            });

            if (records.items.length > 0) {
                const existingRecord = records.items[0];
                // Update existing record
                const pointsToAdd = 20 - existingRecord.level * 2;
                let newPoints = existingRecord.points + pointsToAdd;
                const newLevel = newPoints >= 100 ? Math.min(existingRecord.level + 1, 10) : existingRecord.level;
                newPoints = newPoints >= 100 ? newPoints - 100 : newPoints;

                await pb.collection('game_points').update(existingRecord.id, {
                    points: newPoints,
                    level: newLevel
                });
            } else {
                // Create new record
                // Fetch the topic related to the topic_name
                try {
                    // 1. Find or create the subject

                    console.log("Subject Record:", subjectRecord);

                    // 2. Find or create the topic (linked to subject)

                    console.log("Topic Record:", topicRecord);
                    // 3. Create game_points record
                    await pb.collection('game_points').create({
                        topic: topicRecord.id,
                        subject: subjectRecord.id,
                        points: 20,
                        level: 1,
                        user: user.id,
                        type: 'gymnasium'
                    });

                    return NextResponse.json({
                        success: true,
                        subject: subjectRecord,
                        topic: topicRecord
                    });

                } catch (error) {
                    console.error("Full error:", {
                        status: (error as any)?.status,
                        data: (error as any)?.response?.data,
                        message: (error instanceof Error) ? error.message : 'Unknown error'
                    });
                    return NextResponse.json(
                        { error: "Failed to process game points" },
                        { status: 500 }
                    );
                }
            }
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