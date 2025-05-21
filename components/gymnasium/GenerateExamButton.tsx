// components/GenerateExamButton.jsx
'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface GenerateExamButtonProps {
  subjectId: string;
  topicId: string;
  level:number;
}

export default function GenerateExamButton({ subjectId, topicId,level }: GenerateExamButtonProps) {
  const router = useRouter();
  
  const handleGenerateExam = () => {
    router.push(`/exams/generateexam?subject=${subjectId}&topic=${topicId}&levlel=${level}`);
  };
  
  return (
    <motion.button
      onClick={handleGenerateExam}
      className="flex justify-center items-center bg-indigo-600 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-2 w-full font-medium text-white transition-all duration-300"
      whileHover={{ backgroundColor: "#4338ca" }}
      whileTap={{ scale: 0.98 }}
    >
      <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.25 13.25L17.25 13.25M9.25 17.25L13.25 17.25M19.25 6.25L14.5 4.25L14.5 8.25L19.25 6.25ZM4.75 19.25V4.75H14.5V8.25H19.25V19.25H4.75Z"></path>
      </svg>
      Generate Exam
    </motion.button>
  );
}