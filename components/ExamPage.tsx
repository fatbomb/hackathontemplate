'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPocketBase } from '@/lib/pocketbase';
import ExamView from '@/components/ExamView';
import { LoadingSpinner } from './ui/loading-spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';

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
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const initializeExam = async () => {
            try {
                setLoading(true);
                setError(null);
                const pb = await getPocketBase();

                // Validate authentication
                if (!user) {
                    router.push(`/auth/login?redirect=${encodeURIComponent(`/exams/${examId}`)}`);
                    return;
                }

                // Verify the user is properly authenticated with PocketBase
                if (!pb.authStore.isValid) {
                    try {
                        await pb.collection('users').authRefresh();
                    } catch (refreshError) {
                        console.error('Session expired:', refreshError);
                        router.push(`/auth/login?redirect=${encodeURIComponent(`/exams/${examId}`)}`);
                        return;
                    }
                }

                // Get or create user exam record
                let userExamIdValue = searchParams?.get('userExamId') || '';

                if (!userExamIdValue) {
                    const newUserExam = await pb.collection('user_exams').create({
                        user_id: pb.authStore.model?.id,
                        exam_id: examId,
                        status: 'pending'
                    });
                    userExamIdValue = newUserExam.id;

                    // Update URL without page reload
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.set('userExamId', userExamIdValue);
                    window.history.replaceState({}, '', newUrl.toString());
                } else {
                    // Verify the user exam belongs to the current user
                    const existingExam = await pb.collection('user_exams').getOne(userExamIdValue);
                    if (existingExam.user_id !== pb.authStore.model?.id) {
                        throw new Error('This exam does not belong to you');
                    }
                }

                setUserExamId(userExamIdValue);
            } catch (err: any) {
                console.error('Exam initialization error:', err);
                setError(err.message || 'Failed to initialize exam. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        initializeExam();
    }, [examId, router, searchParams, user, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center gap-4 min-h-[60vh]">
                <LoadingSpinner size="lg" />
                <p className="text-muted-foreground">Preparing your exam session...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center gap-4 p-4 min-h-[60vh]">
                <div className="space-y-2 text-center">
                    <h3 className="font-medium text-destructive text-lg">Error Loading Exam</h3>
                    <p className="text-muted-foreground text-sm">{error}</p>
                </div>
                <Button onClick={handleRetry} variant="outline">
                    Try Again
                </Button>
                <Button asChild variant="ghost">
                    <Link href="/exams">Back to Exams</Link>
                </Button>
            </div>
        );
    }

    if (!userExamId) {
        return (
            <div className="flex flex-col justify-center items-center gap-4 p-4 min-h-[60vh]">
                <div className="space-y-2 text-center">
                    <h3 className="font-medium text-lg">Unable to Start Exam</h3>
                    <p className="text-muted-foreground text-sm">
                        Please check your connection and try again
                    </p>
                </div>
                <Button onClick={handleRetry} variant="outline">
                    Try Again
                </Button>
            </div>
        );
    }

    return <ExamView examId={examId} userExamId={userExamId} />;
}