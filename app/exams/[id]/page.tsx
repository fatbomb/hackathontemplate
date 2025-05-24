import ExamPageClient from './ExamPageClient';
import { initExamSession } from '@/lib/api/exam';

export default async function ExamPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise< { userExamId?: string }>
}) {
  const { userExamId, error } = await initExamSession((await params).id, (await searchParams).userExamId);
  const examId = (await params).id;
  
  return (
    <ExamPageClient 
      initialUserExamId={userExamId ?? null}
      initialError={error}
      examId={examId}
    />
  );
}