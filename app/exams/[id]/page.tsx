'use client';

import { useParams } from 'next/navigation';
import ExamView from '@/components/ExamView';

export default function ExamPage() {
  const params = useParams();
  const examId = params.id as string;
  
  return (
    <main className="bg-gray-50 p-8 min-h-screen">
      <ExamView examId={examId} />
    </main>
  );
}