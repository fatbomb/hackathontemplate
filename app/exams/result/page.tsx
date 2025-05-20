'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPocketBase } from '@/lib/pocketbase';
import { UserExam, Exam } from '@/types';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const examId = searchParams?.get('examId');
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [userExams, setUserExams] = useState<UserExam[]>([]);
  
  useEffect(() => {
    const fetchResults = async () => {
      if (!examId) return;
      
      try {
        setLoading(true);
        const pb = getPocketBase();
        
        // Fetch exam details
        const examData = await pb.collection('exams').getOne(examId);
        setExam({
          id: examData.id,
          user_id: examData.user_id,
          exam_name: examData.exam_name,
          input_text: examData.input_text,
          difficulty: examData.difficulty,
          topic: examData.topic,
          type: examData.type,
          time_limit: examData.time_limit,
          created: examData.created,
        });
        
        // Fetch all user attempts for this exam
        const userId = pb.authStore.model?.id;
        const userExamsData = await pb.collection('user_exams').getFullList({
          filter: `user_id = "${userId}" && exam_id = "${examId}" && status = "completed"`,
          sort: '-end_time'
        });
        
        setUserExams(
          userExamsData.map((ue: any) => ({
            id: ue.id,
            user_id: ue.user_id,
            exam_id: ue.exam_id,
            status: ue.status,
            score: ue.score,
            start_time: ue.start_time,
            end_time: ue.end_time,
          }))
        );
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [examId]);
  
  if (loading) {
    return <div className="py-10 text-center">Loading results...</div>;
  }
  
  if (!exam) {
    return <div className="py-10 text-center">Exam not found</div>;
  }
  
  if (userExams.length === 0) {
    return <div className="py-10 text-center">No completed attempts found for this exam</div>;
  }
  
  // Calculate average score
  const averageScore = userExams.reduce((sum, ue) => sum + (ue.score || 0), 0) / userExams.length;
  
  // Find best score
  const bestScore = Math.max(...userExams.map(ue => ue.score || 0));
  
  return (
    <div className="mx-auto p-6 max-w-4xl container">
      <h1 className="mb-2 font-bold text-3xl">{exam.exam_name} - Results</h1>
      <p className="mb-6 text-gray-600 text-lg">Topic: {exam.topic}</p>
      
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 mb-8">
        <div className="bg-white shadow-md p-6 rounded-lg">
          <h2 className="mb-4 font-semibold text-xl">Performance Summary</h2>
          <p className="mb-2">Total Attempts: <span className="font-medium">{userExams.length}</span></p>
          <p className="mb-2">Average Score: <span className="font-medium">{averageScore.toFixed(1)}%</span></p>
          <p className="mb-2">Best Score: <span className="font-medium">{bestScore.toFixed(1)}%</span></p>
        </div>
        
        <div className="bg-white shadow-md p-6 rounded-lg">
          <h2 className="mb-4 font-semibold text-xl">Exam Details</h2>
          <p className="mb-2">Difficulty: <span className="font-medium">{exam.difficulty}</span></p>
          <p className="mb-2">Time Limit: <span className="font-medium">{exam.time_limit} minutes</span></p>
          <p className="mb-2">Created: <span className="font-medium">{new Date(exam.created).toLocaleDateString()}</span></p>
        </div>
      </div>
      
      <div className="bg-white shadow-md p-6 rounded-lg">
        <h2 className="mb-4 font-semibold text-xl">Attempt History</h2>
        <div className="overflow-x-auto">
          <table className="bg-white min-w-full">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b text-left">Date</th>
                <th className="px-4 py-2 border-b text-left">Score</th>
                <th className="px-4 py-2 border-b text-left">Time Spent</th>
                <th className="px-4 py-2 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userExams.map((userExam) => {
                const timeSpent = userExam.start_time && userExam.end_time
                  ? Math.round((new Date(userExam.end_time).getTime() - new Date(userExam.start_time).getTime()) / 60000)
                  : 'N/A';
                
                return (
                  <tr key={userExam.id}>
                    <td className="px-4 py-2 border-b">
                      {new Date(userExam.end_time || '').toLocaleString()}
                    </td>
                    <td className="px-4 py-2 border-b">
                      {userExam.score?.toFixed(1)}%
                    </td>
                    <td className="px-4 py-2 border-b">
                      {typeof timeSpent === 'number' ? `${timeSpent} minutes` : timeSpent}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <a 
                        href={`/exams/${examId}?userExamId=${userExam.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Review
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}