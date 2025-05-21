import ResultsPageClient from './ResultPageClient';
import { fetchResultsData } from '@/lib/api/result';

export default async function ResultsPage({
  searchParams
}: {
  searchParams: { examId?: string }
}) {
  const { exam, userExams, error } = await fetchResultsData(searchParams.examId);
  const examId = searchParams.examId;
  
  return (
    <ResultsPageClient 
      initialExam={exam||null}
      initialUserExams={userExams || []}
      initialError={error}
      examId={examId || undefined}
    />
  );
}