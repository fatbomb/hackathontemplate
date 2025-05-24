import ResultsPageClient from './ResultPageClient';
import { fetchResultsData } from '@/lib/api/result';

export default async function ResultsPage({
  searchParams
}: {
  searchParams: Promise<{ examId?: string }>
}) {
  const { exam, userExams, error } = await fetchResultsData((await searchParams).examId);
  const examId = (await searchParams).examId;
  console.log("userExams", userExams?.map(exam => exam.answers) ?? []);
  
  return (
    <div className='flex flex-col bg-gray-50 p-8 w-full min-h-screen'>
      <ResultsPageClient 
      initialExam={exam||null}
      initialUserExams={userExams || []}
      initialError={error}
      examId={examId || undefined}
    />
    </div>
  );
}