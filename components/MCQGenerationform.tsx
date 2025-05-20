'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getPocketBase } from '@/lib/pocketbase';
import { MCQGenerationParams } from '@/types';
import { toast } from '@/hooks/use-toast';
import { getCurrentUser } from "@/lib/getUser";
import { redirect } from "next/navigation";

export default function MCQGenerationForm(user:any) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<MCQGenerationParams>({
    refined_text: '',
    difficulty: 'medium',
    num_questions: 10,
    topic_name: '',
    language: 'English',
    exam_name: '',
    time_limit: 30
  });
  
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
      // Check if user is logged in
      

  if (!user) {
    redirect("/login?redirect=/generate");
  }
      
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
      
      if (!formData.refined_text || formData.refined_text.length < 100) {
        toast({ description: 'Please enter a longer text (at least 100 characters)' });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('/api/mcq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      toast({ description: 'MCQ questions generated successfully!' });

      // Redirect to the exam page with the userExamId
      router.push(`/exams/${result.exam_id}?userExamId=${result.user_exam_id}`);
    } catch (error) {
      toast({ description: 'Failed to generate MCQ questions' });
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6 max-w-3xl container">
      <h1 className="mb-6 font-bold text-3xl">Generate MCQ Exam</h1>
      
      <form onSubmit={onSubmit} className="space-y-6 bg-white shadow-md p-6 rounded-lg">
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
            <option value="Chinese">Chinese</option>
            <option value="Japanese">Japanese</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="refined_text" className="block mb-1 font-medium text-sm">
            Source Text
          </label>
          <textarea
            id="refined_text"
            name="refined_text"
            value={formData.refined_text}
            onChange={handleChange}
            rows={10}
            className="px-3 py-2 border rounded-md w-full"
            placeholder="Paste or type the educational content from which to generate questions..."
            required
          ></textarea>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-md w-full font-medium text-white"
        >
          {isLoading ? 'Generating Questions...' : 'Generate MCQ Exam'}
        </button>
      </form>
    </div>
  );
}