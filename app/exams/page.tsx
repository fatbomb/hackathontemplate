import ExamsPageClient from './ExamPageClient';
import { fetchExamsData } from '@/lib/api/exams';

export default async function ExamsPage() {
  const { exams, userExams, error } = await fetchExamsData();
  console.log('Fetched exams:', exams);
    console.log('Fetched user exams:', userExams);
  
  return (
    <ExamsPageClient 
      initialExams={exams || []}
      initialUserExams={userExams || []}
      initialError={error}
    />
  );
}