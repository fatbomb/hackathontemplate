import { getPocketBase } from '@/lib/pocketbase';
import { cookies } from 'next/headers';
import { UserExam } from '@/types';
import { RecordModel } from 'pocketbase';

export async function fetchResultsData(examId?: string) {
    try {
        if (!examId) {
            return { error: 'Exam ID is required' };
        }
        const cookieStore = await cookies();
        const pb = await getPocketBase(cookieStore.toString());

        if (!pb.authStore.isValid) {
            try {
                await pb.collection('users').authRefresh();
            } catch {
                return { error: 'Session expired' };
            }
        }

        const [examData, userExamsData] = await Promise.all([
            pb.collection('exams').getOne(examId),
            pb.collection('user_exams').getFullList({
                filter: `user_id="${pb.authStore.model?.id}" && exam_id="${examId}" && status="completed"`,
                sort: '-completed_at'
            })
        ]);

        // Fetch questions for the exam
        const questions = await pb.collection('questions').getFullList({
            filter: `exam_id="${examId}"`,
            sort: 'created'
        });

        // Fetch user answers for each user exam
        const userExamsWithAnswers = await Promise.all(
            userExamsData.map(async (ue: RecordModel) => {
            const userExam: UserExam = {
                id: ue.id,
                user_id: ue.user_id,
                exam_id: ue.exam_id,
                status: ue.status,
                completed_at: ue.completed_at,
                started_at: ue.started_at,
            };
            const userAnswers = await pb.collection('user_answers').getFullList({
                filter: `user_exam_id="${ue.id}"`,
                sort: 'question_id'
            });
            return {
                ...userExam,
                answers: userAnswers.map(ua => ({
                id: ua.id,
                question_id: ua.question_id,
                answer: ua.selected_answer,
                created: ua.created,
                }))
            };
            })
        );

        return {
            exam: {
                id: examData.id,
                user_id: examData.user_id,
                exam_name: examData.exam_name,
                input_text: examData.input_text,
                difficulty: examData.difficulty,
                topic: examData.topic,
                type: examData.type,
                time_limit: examData.time_limit,
                created: examData.created,
                questions: questions.map(q => ({
                    id: q.id,
                    text: q.text,
                    options: q.options,
                    correct_option: Number(q.correct_answer),
                    created: q.created,
                    explanation: q.explaination
                }))
            },
            userExams: userExamsWithAnswers,
            error: null
        };
    } catch (error) {
        console.error('Error fetching results:', error);
        return {
            exam: null,
            userExams: [],
            error: 'Failed to load results'
        };
    }
}