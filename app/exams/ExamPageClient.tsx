'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Exam, UserExam } from '@/types';
import { PlusCircle, BookOpen, BarChart3, Clock } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';

interface ExamsPageClientProps {
    initialExams: Exam[];
    initialUserExams: UserExam[];
    initialError: string | null;
}

export default function ExamsPageClient({
    initialExams,
    initialUserExams,
    initialError
}: ExamsPageClientProps) {
 
    const [exams, setExams] = useState<Exam[]>(initialExams);
    const [userExams, setUserExams] = useState<UserExam[]>(initialUserExams);
    const [error, setError] = useState<string | null>(initialError);
    const [loading, setLoading] = useState(false);

    const handleRetry = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/exams');
            if (!response.ok) {
                throw new Error('Failed to load exams');
            }
            const { exams, userExams } = await response.json();
            setExams(exams);
            setUserExams(userExams);
        } catch (err) {
            console.error(err);
            setError( 'Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto p-6 max-w-7xl container">
                <ErrorMessage
                    message={error}
                    onRetry={handleRetry}
                />
            </div>
        );
    }

    // ... rest of your component remains exactly the same ...
    return (
        <div className="mx-auto p-6 max-w-7xl container">
            <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-4 mb-10">
                <h1 className="bg-clip-text font-bold text-3xl">
                    Your Exams
                </h1>

                <Button asChild className="gap-2">
                    <Link href="/gymnasium">
                        <PlusCircle size={18} />
                        Create New Exam
                    </Link>
                </Button>
            </div>

            {exams.length === 0 ? (
                <div className="bg-white shadow-sm p-8 md:p-12 rounded-xl text-center">
                    <div className="flex justify-center items-center bg-blue-50 mx-auto mb-6 rounded-full w-16 md:w-20 h-16 md:h-20">
                        <BookOpen size={28} className="text-blue-500" />
                    </div>
                    <h3 className="mb-2 font-semibold text-xl">No Exams Found</h3>
                    <p className="mx-auto mb-6 max-w-md text-gray-500">
                        You have not created any exams yet. Start by creating your first exam to test your knowledge.
                    </p>
                    <Button asChild className="gap-2">
                        <Link href="/generate">
                            <PlusCircle size={18} />
                            Create Your First Exam
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="gap-6 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {exams.map(exam => {
                        const relatedUserExams = userExams.filter(ue => ue.exam_id === exam.id);
                        const hasCompleted = relatedUserExams.some(ue => ue.status === 'completed');
                        const bestScore = Math.max(...relatedUserExams.map(ue => ue.score || 0));

                        const difficultyColor = {
                            easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                            hard: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }[exam.difficulty.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';

                        return (
                            <div
                                key={exam.id}
                                className="flex flex-col bg-white dark:bg-gray-900 shadow-sm hover:shadow-md dark:hover:shadow-lg border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden transition-shadow duration-200"
                            >
                                <div className="flex-grow p-5">
                                    <h2 className="mb-3 font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-2">
                                        {exam.exam_name}
                                    </h2>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
                                            {exam.difficulty}
                                        </span>
                                        <span className="bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full font-medium text-blue-800 dark:text-blue-400 text-xs">
                                            {exam.topic}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                            <Clock size={16} className="flex-shrink-0 mr-2" />
                                            <span>{exam.time_limit} minutes</span>
                                        </div>

                                        <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
                                            <BookOpen size={16} className="flex-shrink-0 mr-2" />
                                            <span>Created {new Date(exam.created).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {hasCompleted && (
                                        <div className="flex items-center bg-blue-50 dark:bg-blue-900/20 mb-4 p-3 border dark:border-blue-800/30 rounded-lg">
                                            <BarChart3 size={18} className="flex-shrink-0 mr-2 text-blue-600 dark:text-blue-400" />
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400 text-sm">Best Score</p>
                                                <p className="font-semibold text-blue-700 dark:text-blue-300">
                                                    {bestScore.toFixed(1)}%
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-3 border-gray-100 dark:border-gray-700 border-t">
                                    <div className="flex gap-3">
                                        <Button asChild variant="default" className="flex-1">
                                            <Link href={`/exams/${exam.id}?userExamId=${relatedUserExams[0]?.id}`}>
                                                Take Exam
                                            </Link>
                                        </Button>

                                        {hasCompleted && (
                                            <Button asChild variant="outline" className="flex-1">
                                                <Link href={`/exams/result?examId=${exam.id}`}>
                                                    View Results
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}