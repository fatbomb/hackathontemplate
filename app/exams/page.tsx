'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPocketBase } from '@/lib/pocketbase';
import { Exam, UserExam } from '@/types';
import { parseJWT } from '@/lib/jwt';
import { PlusCircle, BookOpen, BarChart3, Clock } from 'lucide-react'; // Import Lucide icons

export default function ExamsPage() {
    const router = useRouter();
    const [exams, setExams] = useState<Exam[]>([]);
    const [userExams, setUserExams] = useState<UserExam[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const pb = getPocketBase();
                const cookies = localStorage.getItem('pb_auth') 
                
                const decodeToken = parseJWT(cookies || '');
                if (!decodeToken.id) {
                    router.push('/login?redirect=/exams');
                    return;
                }

                const userId = decodeToken.id;

                // Get all exams created by the user
                const examsData = await pb.collection('exams').getFullList({
                    filter: `user_id = "${userId}"`,
                    sort: '-created'
                });

                // Get all user_exams for this user
                const userExamsData = await pb.collection('user_exams').getFullList({
                    filter: `user_id = "${userId}"`,
                    expand: 'exam_id'
                });

                setExams(
                    examsData.map((rec: any) => ({
                        id: rec.id,
                        user_id: rec.user_id,
                        exam_name: rec.exam_name,
                        input_text: rec.input_text,
                        difficulty: rec.difficulty,
                        topic: rec.topic,
                        type: rec.type,
                        time_limit: rec.time_limit,
                        created: rec.created,
                    }))
                );
                setUserExams(
                    userExamsData.map((rec: any) => ({
                        id: rec.id,
                        user_id: rec.user_id,
                        exam_id: rec.exam_id,
                        status: rec.status,
                        score: rec.score,
                        expand: rec.expand,
                    }))
                );
            } catch (error) {
                console.error('Error fetching exams:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchExams();
    }, [router]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh]">
                <div className="border-t-2 border-b-2 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="mx-auto p-6 max-w-7xl container">
            <div className="flex justify-between items-center mb-10">
                <h1 className="bg-clip-text bg-gradient-to-r from-gray-600 to-gray-900 font-bold text-transparent text-3xl">
                    Your Exams
                </h1>

                <Link 
                    href="/exams/createexam" 
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 hover:from-blue-700 to-indigo-600 hover:to-indigo-700 shadow-md hover:shadow-lg px-5 py-2.5 rounded-lg font-medium text-white transition-all duration-200"
                >
                    <PlusCircle size={18} />
                    Create New Exam
                </Link>
            </div>

            {exams.length === 0 ? (
                <div className="bg-white shadow-sm p-12 rounded-xl text-center">
                    <div className="flex justify-center items-center bg-blue-50 mx-auto mb-6 rounded-full w-20 h-20">
                        <BookOpen size={32} className="text-blue-500" />
                    </div>
                    <h3 className="mb-2 font-semibold text-xl">No Exams Found</h3>
                    <p className="mx-auto mb-8 max-w-md text-gray-500">
                        You haven't created any exams yet. Start by creating your first exam to test your knowledge.
                    </p>
                    <Link 
                        href="/generate" 
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-lg font-medium text-white transition-colors duration-200"
                    >
                        <PlusCircle size={18} />
                        Create Your First Exam
                    </Link>
                </div>
            ) : (
                <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3">
                    {exams.map(exam => {
                        // Find related user exams
                        const relatedUserExams = userExams.filter(ue => ue.exam_id === exam.id);
                        const hasCompleted = relatedUserExams.some(ue => ue.status === 'completed');
                        const bestScore = relatedUserExams.reduce((max, ue) => Math.max(max, ue.score || 0), 0);
                        
                        // Determine the difficulty badge color
                        let difficultyColor;
                        switch (exam.difficulty.toLowerCase()) {
                            case 'easy':
                                difficultyColor = 'bg-green-100 text-green-800';
                                break;
                            case 'medium':
                                difficultyColor = 'bg-yellow-100 text-yellow-800';
                                break;
                            case 'hard':
                                difficultyColor = 'bg-red-100 text-red-800';
                                break;
                            default:
                                difficultyColor = 'bg-gray-100 text-gray-800';
                        }

                        return (
                            <div key={exam.id} className="flex flex-col bg-white shadow-sm hover:shadow-md rounded-xl overflow-hidden transition-shadow duration-200">
                                <div className="flex-grow p-6">
                                    <h2 className="mb-3 font-bold text-gray-900 text-xl line-clamp-2">{exam.exam_name}</h2>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${difficultyColor}`}>
                                            {exam.difficulty}
                                        </span>
                                        <span className="bg-blue-100 px-2.5 py-1 rounded-full font-medium text-blue-800 text-xs">
                                            {exam.topic}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600">
                                            <Clock size={16} className="mr-2" />
                                            <span>{exam.time_limit} minutes</span>
                                        </div>
                                        
                                        <div className="flex items-center text-gray-600">
                                            <BookOpen size={16} className="mr-2" />
                                            <span>Created {new Date(exam.created).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {hasCompleted && (
                                        <div className="flex items-center bg-blue-50 mb-4 p-3 rounded-lg">
                                            <BarChart3 size={18} className="mr-2 text-blue-600" />
                                            <div>
                                                <p className="text-gray-600 text-sm">Best Score</p>
                                                <p className="font-semibold text-blue-700 text-lg">{bestScore.toFixed(1)}%</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-gray-50 px-6 py-4 border-gray-100 border-t">
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/exams/${exam.id}`}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white text-center transition-colors"
                                        >
                                            Take Exam
                                        </Link>

                                        {relatedUserExams.some(ue => ue.status === 'completed') && (
                                            <Link
                                                href={`/results?examId=${exam.id}`}
                                                className="flex-1 bg-white hover:bg-gray-50 px-4 py-2 border border-gray-200 rounded-lg font-medium text-gray-700 text-center transition-colors"
                                            >
                                                View Results
                                            </Link>
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