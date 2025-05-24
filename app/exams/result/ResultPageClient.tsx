'use client';

import { useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { Button } from '@/components/ui/button';
import { Clock, Award, BarChart2, Calendar, History } from 'lucide-react';
import Link from 'next/link';
interface Question {
    id: string;
    text: string;
    options: string[];
    correct_option: number;
    created: string;
    explanation: string;
}
interface Exam {
    id: string;
    user_id: string;
    exam_name: string;
    input_text: string;
    difficulty: string;
    topic: string;
    type: string;
    time_limit: number;
    created: Date;
    questions: Question[];
}
interface Answers {

    id: string;
    question_id: string;
    answer: number;
    created: Date;
}

interface CustomUserExam {
    answers: {
        id: string;
        question_id: string;
        answer: number;
        created: Date;
    }[];
    id: string;
    user_id: string;
    exam_id: string;
    status: "pending" | "completed" | "in_progress";
    score?: number | undefined;
    started_at?: Date | undefined;
    completed_at?: Date | undefined;
}


interface ResultsPageClientProps {
    initialExam: Exam | null;
    initialUserExams: CustomUserExam[];
    initialError: string | null;
    examId?: string;
}

export default function ResultsPageClient({
    initialExam,
    initialUserExams,
    initialError,
    examId
}: ResultsPageClientProps) {
    const [exam, setExam] = useState(initialExam);
    const [userExams, setUserExams] = useState(initialUserExams);
    const [error, setError] = useState(initialError);
    const [loading, setLoading] = useState(false);
    const [selectedAttempt, setSelectedAttempt] = useState<CustomUserExam | null>(null);

    const handleRetry = async () => {
        if (!examId) return;

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/results?examId=${examId}`);
            if (!response.ok) {
                throw new Error('Failed to load results');
            }
            const { exam, userExams } = await response.json();
            setExam(exam);
            setUserExams(userExams);
        } catch (err) {
            console.error(err);
            setError('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (attempt: CustomUserExam) => {
        setSelectedAttempt(attempt);
    };

    const handleCloseDetails = () => {
        setSelectedAttempt(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto p-6 max-w-4xl container">
                <ErrorMessage
                    message={error}
                    onRetry={handleRetry}
                />
            </div>
        );
    }

    if (!exam) {
        return (
            <div className="mx-auto p-6 max-w-4xl text-center container">
                <div className="bg-white shadow-sm p-8 rounded-lg">
                    <h2 className="mb-4 font-semibold text-xl">Exam Not Found</h2>
                    <p className="mb-4 text-gray-600">The requested exam could not be found or you do not have permission to view it.</p>
                    <Button asChild>
                        <Link href="/exams">Back to Exams</Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (userExams.length === 0) {
        return (
            <div className="mx-auto p-6 max-w-4xl container">
                <div className="bg-white shadow-sm p-8 rounded-lg text-center">
                    <div className="flex justify-center items-center bg-gray-100 mx-auto mb-4 rounded-full w-16 h-16">
                        <History className="text-gray-500" size={24} />
                    </div>
                    <h2 className="mb-2 font-semibold text-xl">No Attempts Found</h2>
                    <p className="mb-6 text-gray-600">You have not completed this exam yet.</p>
                    <Button asChild>
                        <Link href={`/exams/${exam.id}`}>Take Exam Now</Link>
                    </Button>
                </div>
            </div>
        );
    }

    // Calculate statistics
    const averageScore = userExams.reduce((sum, ue) => sum + (ue.score || 0), 0) / userExams.length;
    const bestScore = Math.max(...userExams.map(ue => ue.score || 0));

    return (
        <div className="mx-auto p-4 sm:p-6 max-w-4xl container">
            <div className="mb-8">
                <h1 className="mb-2 font-bold text-2xl sm:text-3xl">{exam.exam_name}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 bg-blue-100 px-3 py-1 rounded-full text-sm">
                        <span className="text-blue-800">{exam.topic}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm">
                        <span className="text-gray-800">{exam.difficulty}</span>
                    </span>
                </div>
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-3 mb-8">
                <div className="bg-white shadow-sm p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart2 className="text-blue-500" size={20} />
                        <h3 className="font-medium">Average Score</h3>
                    </div>
                    <p className="font-bold text-2xl">{averageScore.toFixed(1)}%</p>
                </div>

                <div className="bg-white shadow-sm p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Award className="text-yellow-500" size={20} />
                        <h3 className="font-medium">Best Score</h3>
                    </div>
                    <p className="font-bold text-2xl">{bestScore.toFixed(1)}%</p>
                </div>

                <div className="bg-white shadow-sm p-4 border rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="text-green-500" size={20} />
                        <h3 className="font-medium">Attempts</h3>
                    </div>
                    <p className="font-bold text-2xl">{userExams.length}</p>
                </div>
            </div>

            <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
                <div className="p-4 border-b">
                    <h2 className="flex items-center gap-2 font-semibold text-lg">
                        <History size={18} />
                        Attempt History
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 font-medium text-gray-500 text-sm text-left">Date</th>
                                <th className="px-4 py-3 font-medium text-gray-500 text-sm text-left">Score</th>
                                <th className="px-4 py-3 font-medium text-gray-500 text-sm text-left">Duration</th>
                                <th className="px-4 py-3 font-medium text-gray-500 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {userExams.map((userExam) => {
                                const timeSpent = userExam.started_at && userExam.completed_at
                                    ? Math.round((new Date(userExam.completed_at).getTime() - new Date(userExam.started_at).getTime()) / 60000)
                                    : null;

                                return (
                                    <tr key={userExam.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span className="text-sm">
                                                    {new Date(userExam.completed_at || '').toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${(userExam.score || 0) >= 70 ? 'bg-green-100 text-green-800' :
                                                (userExam.score || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {userExam.score?.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 text-sm whitespace-nowrap">
                                            {timeSpent ? `${timeSpent.toFixed(0)} min` : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-sm text-right whitespace-nowrap">
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto"
                                                onClick={() => handleViewDetails(userExam)}
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed View Modal */}
            {selectedAttempt && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white shadow-xl rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="font-bold text-xl">
                                    Attempt Details - {new Date(selectedAttempt.completed_at || '').toLocaleString()}
                                </h2>
                                <button
                                    onClick={handleCloseDetails}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="bg-blue-50 mb-6 p-4 rounded-lg">
                                <div className="gap-4 grid grid-cols-3">
                                    <div>
                                        <p className="text-gray-600 text-sm">Score</p>
                                        <p className="font-bold text-lg">{selectedAttempt.score?.toFixed(1)}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Time Spent</p>
                                        <p className="font-bold text-lg">
                                            {selectedAttempt.started_at && selectedAttempt.completed_at
                                                ? `${Math.round((new Date(selectedAttempt.completed_at).getTime() - new Date(selectedAttempt.started_at).getTime()) / 60000)} min`
                                                : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Submitted</p>
                                        <p className="font-bold text-lg">
                                            {new Date(selectedAttempt.completed_at || '').toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {exam.questions.map((question: Question, index: number) => {
                                    const userAnswer = selectedAttempt.answers?.find((a: Answers) => a.question_id === question.id);
                                    const isCorrect = userAnswer?.answer === question.correct_option;

                                    return (
                                        <div key={question.id} className="border rounded-lg overflow-hidden">
                                            <div className={`p-4 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                                                <h3 className="font-medium">
                                                    Question {index + 1}: {question.text}
                                                </h3>
                                            </div>

                                            <div className="p-4">
                                                <div className="space-y-3">
                                                    {question.options.map((option: string, optionIndex: number) => {
                                                        const isSelected = userAnswer?.answer === optionIndex;
                                                        const isCorrectOption = question.correct_option === optionIndex;

                                                        return (
                                                            <div
                                                                key={optionIndex}
                                                                className={`p-3 border rounded-md ${isCorrectOption ? 'border-green-500 bg-green-50' :
                                                                    isSelected ? 'border-red-500 bg-red-50' :
                                                                        'border-gray-200'
                                                                    }`}
                                                            >
                                                                <span className="font-medium">
                                                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                                                </span>
                                                                {isSelected && (
                                                                    <span className="ml-2 font-medium text-sm">
                                                                        {isCorrectOption && isSelected ? '✓ Correct' : '✗ Your Answer'}
                                                                    </span>
                                                                )}
                                                                {isCorrectOption && !isSelected && (
                                                                    <span className="ml-2 font-medium text-green-600 text-sm">
                                                                        ✓ Correct Answer
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className='space-y-2 mt-4 p-3 border rounded-md'>
                                                    <span className="font-medium">
                                                        {question.explanation}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end mt-6">
                                <Button onClick={handleCloseDetails}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}