'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { redirect } from "next/navigation";
import { useSearchParams } from 'next/navigation';
import { AuthRecord } from 'pocketbase';

export default function MCQGenerationForm(user: AuthRecord) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false); // NEW STATE
  const [userExamId, setUserExamId] = useState<string | null>(null); // For redirect
  const [examId, setExamId] = useState<string | null>(null); // For redirect
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic');
  const subject = searchParams.get('subject');
  const level = searchParams.get('level')||'1';

  useEffect(() => {
    if (topic) {
      setFormData(prev => ({ ...prev, topic_name: topic }));
    }
    if (subject) {
      setFormData(prev => ({ ...prev, subject: subject }));

    }
      setFormData(prev => ({ ...prev, exam_name: `${subject} ${topic} level ${level}` }));
    
  }, [topic, subject]);

  
  const [formData, setFormData] = useState({
    refined_text: '',
    difficulty: 'medium',
    num_questions: 10,
    topic_name: '',
    language: 'English',
    exam_name: '',
    subject: subject || '',
    Class: '9',
    time_limit: 30
  });

  // ...handleChange remains unchanged
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'num_questions' || name === 'time_limit' ? parseInt(value) : value
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) {
        redirect("/auth/login?redirect=/exams/generate");
      }

      // Validation (unchanged)
       // Validation
      if (!formData.exam_name) {
        toast({ description: 'Please enter an exam name' });
        setIsLoading(false);
        return;
      }
      
      if (!formData.topic_name) {
        toast({ description: 'Please enter a topic name' });
        setIsLoading(false);
        return;
      }
      if (!formData.Class) {
        toast({ description: 'Please enter a Class' });
        setIsLoading(false);
        return;
      }
      if (!formData.subject) {
        toast({ description: 'Please enter a Subject name' });
        setIsLoading(false);
        return;
      }
      

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
      setUserExamId(result.user_exam_id); // Save exam id if returned
      setExamId(result.exam_id); // Save exam id if returned

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


      <form onSubmit={onSubmit} className="space-y-6 bg-white shadow-md p-6 rounded-lg">
        {/* ...form fields unchanged... */}
        <div>
          <label htmlFor="exam_name" className="block mb-1 font-medium text-sm">
            Exam Name
          </label>
          <input
            type="text"
            id="exam_name"
            name="exam_name"
            value={formData.exam_name}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md w-full"
            placeholder="Enter a name for this exam"
            required
          />
        </div>
        <div>
          <label htmlFor="exam_name" className="block mb-1 font-medium text-sm">
            Class
          </label>
          <input
            type="text"
            id="Class"
            name="Class"
            value={formData.Class}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md w-full"
            placeholder="Enter a name for this exam"
            required
          />
        </div>
        <div>
          <label htmlFor="exam_name" className="block mb-1 font-medium text-sm">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md w-full"
            placeholder="Enter a name for this exam"
            required
          />
        </div>
        
        <div>
          <label htmlFor="topic_name" className="block mb-1 font-medium text-sm">
            Topic
          </label>
          <input
            type="text"
            id="topic_name"
            name="topic_name"
            value={formData.topic_name}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md w-full"
            placeholder="e.g., Photosynthesis, World War II, Algebra"
            required
          />
        </div>
        
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
          <div>
            <label htmlFor="difficulty" className="block mb-1 font-medium text-sm">
              Difficulty
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="px-3 py-2 border rounded-md w-full"
              >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="num_questions" className="block mb-1 font-medium text-sm">
              Number of Questions
            </label>
            <input
              type="number"
              id="num_questions"
              name="num_questions"
              value={formData.num_questions}
              onChange={handleChange}
              min={5}
              max={30}
              className="px-3 py-2 border rounded-md w-full"
            />
          </div>
          
          <div>
            <label htmlFor="time_limit" className="block mb-1 font-medium text-sm">
              Time Limit (minutes)
            </label>
            <input
              type="number"
              id="time_limit"
              name="time_limit"
              value={formData.time_limit}
              onChange={handleChange}
              min={5}
              max={120}
              className="px-3 py-2 border rounded-md w-full"
            />
             </div>
        
        <div>
          <label htmlFor="language" className="block mb-1 font-medium text-sm">
            Language
          </label>
          <select
            id="language"
            name="language"
            value={formData.language}
            onChange={handleChange}
            className="px-3 py-2 border rounded-md w-full"
          >
            <option value="English">English</option>
            <option value="Spanish">Spanish</option>
            <option value="French">French</option>
            <option value="German">German</option>
            <option value="Bangla">Bangla</option>
            <option value="Japanese">Japanese</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
        
        
          
        </div>
        
        

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
