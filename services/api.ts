import pb from '@/lib/pocketbase';
import { MCQQuestion, Exam, Question, UserExam, TaskProgress } from '@/types';
import axios from 'axios';

// Use your own AI service URL or provider
const AI_SERVICE_URL = 'https://your-ai-service-url.com/generate-mcq';

export const AIService = {
  async generateMCQQuestions(params: {
    refined_text: string;
    difficulty: string;
    num_questions: number;
    topic_name: string;
  }): Promise<MCQQuestion[]> {
    try {
      // You will need to implement or connect to an AI service
      // This is a placeholder for where you'd make API calls to your AI provider
      const response = await axios.post(AI_SERVICE_URL, params);
      return response.data;
    } catch (error) {
      console.error('Error generating MCQ questions:', error);
      throw error;
    }
  },

  // Simulate the JSON processing similar to _process_response in your Python code
  processResponse(response: string, num_questions: number): MCQQuestion[] {
    try {
      const jsonStart = response.indexOf('[');
      const jsonEnd = response.lastIndexOf(']') + 1;
      
      if (jsonStart === -1 || jsonEnd === -1) {
        console.log('JSON content not found in response.');
        return [];
      }
      
      const jsonText = response.substring(jsonStart, jsonEnd);
      const batchQuestions = JSON.parse(jsonText);
      
      const allGeneratedQuestions: MCQQuestion[] = [];
      
      for (const question of batchQuestions) {
        if (allGeneratedQuestions.length >= num_questions) {
          break;
        }
        
        const questionText = question.question || '';
        const options = question.options || [];
        const answerText = question.answer || '';
        const explanation = question.explanation || '';
        
        if (questionText && options.length === 4) {
          try {
            const answerIndex = options.indexOf(answerText);
            if (answerIndex !== -1) {
              question.answer = answerIndex;
              allGeneratedQuestions.push(question);
            }
          } catch (e) {
            console.log(`Skipping invalid question: ${questionText}`);
          }
        }
      }
      
      return allGeneratedQuestions;
    } catch (error) {
      console.error('Failed to process response:', error);
      return [];
    }
  }
};

export const ExamService = {
  async createExam(examData: Exam): Promise<any> {
    return await pb.collection('exams').create(examData);
  },
  
  async getExam(examId: string): Promise<any> {
    return await pb.collection('exams').getOne(examId);
  }
};

export const QuestionService = {
  async createQuestion(questionData: Question): Promise<any> {
    return await pb.collection('questions').create(questionData);
  },
  
  async getQuestionsByExamId(examId: string): Promise<any[]> {
    return await pb.collection('questions').getFullList({
      filter: `exam_id = "${examId}"`,
    });
  }
};

export const UserExamService = {
  async assignExamToUser(userId: string, examId: string): Promise<any> {
    const userExamData = {
      user_id: userId,
      exam_id: examId,
      status: 'pending'
    };
    return await pb.collection('user_exams').create(userExamData);
  },
  
  async getUserExams(userId: string): Promise<any[]> {
    return await pb.collection('user_exams').getFullList({
      filter: `user_id = "${userId}"`,
      expand: 'exam_id'
    });
  }
};

export const TaskProgressService = {
  async createTask(): Promise<string> {
    const task = await pb.collection('tasks_progress').create({
      task_id: Date.now().toString(),
      status: 'pending',
      created_at: new Date().toISOString()
    });
    return task.id;
  },
  
  async updateTask(progressId: string, status: string): Promise<any> {
    return await pb.collection('tasks_progress').update(progressId, { status });
  },
  
  async deleteTask(progressId: string): Promise<boolean> {
    await pb.collection('tasks_progress').delete(progressId);
    return true;
  }
};