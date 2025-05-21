import ExamPageClient from './ExamPageClient';
import { initExamSession } from '@/lib/api/exam';

export default async function ExamPage({
  params,
  searchParams
}: {
  params: { id: string },
  searchParams: { userExamId?: string }
}) {
  const { userExamId, error } = await initExamSession(params.id, searchParams.userExamId);
  const examId = params.id;
  
  return (
    <ExamPageClient 
      initialUserExamId={userExamId ?? null}
      initialError={error}
      examId={examId}
    />
  );
}