import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';
import { MCQGenerationParams } from '@/types';

export default function MCQGenerationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<MCQGenerationParams>();
  
  const onSubmit = async (data: MCQGenerationParams) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/mcq', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      toast({description: 'MCQ questions generated successfully!'});

      // Redirect to the exam page
      window.location.href = `/exams/${result.exam_id}`;
    } catch (error) {
      toast({description: 'Failed to generate MCQ questions'});
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md mx-auto p-6 rounded-lg max-w-4xl">
      <h1 className="mb-6 font-bold text-2xl">Generate MCQ Questions</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-700 text-sm">Exam Name</label>
          <input
            type="text"
            {...register('exam_name', { required: 'Exam name is required' })}
            className="block shadow-sm mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
          {errors.exam_name && <p className="text-red-500 text-sm">{errors.exam_name.message}</p>}
        </div>
        
        <div>
          <label className="block font-medium text-gray-700 text-sm">Topic Name</label>
          <input
            type="text"
            {...register('topic_name', { required: 'Topic name is required' })}
            className="block shadow-sm mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
          {errors.topic_name && <p className="text-red-500 text-sm">{errors.topic_name.message}</p>}
        </div>
        
        <div>
          <label className="block font-medium text-gray-700 text-sm">Content</label>
          <textarea
            {...register('refined_text', { required: 'Content is required' })}
            rows={6}
            className="block shadow-sm mt-1 p-2 border border-gray-300 rounded-md w-full"
            placeholder="Enter the content for generating questions..."
          />
          {errors.refined_text && <p className="text-red-500 text-sm">{errors.refined_text.message}</p>}
        </div>
        
        <div>
          <label className="block font-medium text-gray-700 text-sm">Difficulty</label>
          <select
            {...register('difficulty', { required: 'Difficulty is required' })}
            className="block shadow-sm mt-1 p-2 border border-gray-300 rounded-md w-full"
          >
            <option value="">Select difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          {errors.difficulty && <p className="text-red-500 text-sm">{errors.difficulty.message}</p>}
        </div>
        
        <div>
          <label className="block font-medium text-gray-700 text-sm">Number of Questions</label>
          <input
            type="number"
            {...register('num_questions', { 
              required: 'Number of questions is required',
              min: { value: 1, message: 'Minimum 1 question' },
              max: { value: 50, message: 'Maximum 50 questions' }
            })}
            className="block shadow-sm mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
          {errors.num_questions && <p className="text-red-500 text-sm">{errors.num_questions.message}</p>}
        </div>
        
                <div>
          <label className="block font-medium text-gray-700 text-sm">Time Limit (minutes)</label>
          <input
            type="number"
            {...register('time_limit', { 
              required: 'Time limit is required',
              min: { value: 1, message: 'Minimum 1 minute' },
              max: { value: 180, message: 'Maximum 180 minutes' }
            })}
            className="block shadow-sm mt-1 p-2 border border-gray-300 rounded-md w-full"
          />
          {errors.time_limit && <p className="text-red-500 text-sm">{errors.time_limit.message}</p>}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-md font-bold text-white"
          >
            {isLoading ? 'Generating...' : 'Generate MCQ Questions'}
          </button>
        </div>
      </form>
    </div>
  );
}