'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPocketBase } from '@/lib/pocketbase';
import ExamView from '@/components/ExamView';

interface ExamInitializerProps {
    params: { id: string };
    user: any;
}

export default function ExamInitializer({ params, user }: ExamInitializerProps) {
    const examId = params.id;
    const router = useRouter();
    const searchParams = useSearchParams();
    const [userExamId, setUserExamId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    console.log(user, "here user");

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);

                // Check if user is authenticated
                const pb = getPocketBase();
                if (!user) {
                    router.push('/auth/login?redirect=' + encodeURIComponent(`/exams/${examId}`));
                    return;
                }

                // Get userExamId from query param or create a new one
                let userExamIdValue = searchParams?.get('userExamId');

                if (!userExamIdValue) {
                    // Create a new user_exam record
                    const userId = pb.authStore.model?.id;
                    const newUserExam = await pb.collection('user_exams').create({
                        user_id: userId,
                        exam_id: examId,
                        status: 'pending'
                    });
                    userExamIdValue = newUserExam.id;

                    // Update URL with userExamId without refreshing page
                    const url = new URL(window.location.href);
                    url.searchParams.set('userExamId', userExamIdValue);
                    window.history.replaceState({}, '', url.toString());
                }

                setUserExamId(userExamIdValue);
            } catch (err) {
                console.error('Error initializing exam:', err);
                setError('Failed to load exam. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, [examId, router, searchParams]);

    if (loading) return <div className="py-10 text-center">Initializing exam...</div>;
    if (error) return <div className="py-10 text-red-500 text-center">{error}</div>;
    if (!userExamId) return <div className="py-10 text-center">Unable to start exam</div>;

    return <ExamView examId={examId} userExamId={userExamId} />;
}