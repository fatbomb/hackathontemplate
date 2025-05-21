import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { redirect } from "next/navigation";

export default function MCQGenerationForm(user: any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false); // NEW STATE
  const [userExamId, setUserExamId] = useState<string | null>(null); // For redirect
  const [examId, setExamId] = useState<string | null>(null); // For redirect
  const [formData, setFormData] = useState({
    refined_text: '',
    difficulty: 'medium',
    num_questions: 10,
    topic_name: '',
    language: 'English',
    exam_name: '',
    time_limit: 30
  });

  // ...handleChange remains unchanged

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        redirect("/login?redirect=/generate");
      }

      // Validation (unchanged)

      const response = await fetch('/api/mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      toast({ description: 'MCQ questions generated successfully!' });
      setIsGenerated(true); // SET GENERATED STATE
      setUserExamId(result.userExamId); // Save exam id if returned
      setExamId(result.examId); // Save exam id if returned

    } catch (error) {
      toast({ description: 'Failed to generate MCQ questions' });
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers for the two options
  const handleSaveForLater = () => {
    toast({ description: 'Exam saved for later!' });
    router.push('/exams'); // Change as needed
  };

  const handleGiveExamNow = () => {
    if (userExamId) {
      router.push(`/exams/${examId}?userExamId=${userExamId}`);
    } else {
      toast({ description: 'Exam ID not found.' });
    }
  };

  return (
    <div className="mx-auto p-6 max-w-3xl container">
      <h1 className="mb-6 font-bold text-3xl">Generate MCQ Exam</h1>

      <form onSubmit={onSubmit} className="space-y-6 bg-white shadow-md p-6 rounded-lg">
        {/* ...form fields unchanged... */}

        {!isGenerated ? (
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-md w-full font-medium text-white"
          >
            {isLoading ? 'Generating Questions...' : 'Generate MCQ Exam'}
          </button>
        ) : (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSaveForLater}
              className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded-md w-full font-medium text-white"
            >
              Save for Later
            </button>
            <button
              type="button"
              onClick={handleGiveExamNow}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md w-full font-medium text-white"
            >
              Give Exam Now
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
