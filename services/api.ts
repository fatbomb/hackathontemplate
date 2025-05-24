import { getPocketBase } from '@/lib/pocketbase';
import { 
  Exam, 
  ClientQuestion, 
  ServerQuestion, 
  UserExam, 
  UserAnswer,
  ExamResult,
  MCQQuestion
} from '@/types';
import { generateWithGemini } from './ai';
import { renderMDX } from '@/lib/mdx-remote';

// // Use your own AI service URL or provider
// // const AI_SERVICE_URL = 'https://your-ai-service-url.com/generate-mcq';
// function sanitizeMCQJson(text: string) {
//   // Remove non-JSON garbage
//   text = text
//     .replace(/,\s*([\]}])/g, '$1')  // Remove trailing commas
//     .replace(/([}\]])[^}\]]+?(?=\s*[}\]])/g, '$1')  // Remove extra tokens after arrays or objects
//     .replace(/^[^{\[]*|[^{\]}]*$/g, ''); // Remove anything outside top-level structure

//   let parsed;
//   try {
//     parsed = JSON.parse(`[${text
//       .trim()
//       // Try to convert single MCQ object to array if it's not wrapped
//       .replace(/^\s*{/, '{').replace(/}\s*$/, '}')}]`);
//   } catch (err) {
//     if (err instanceof Error) {
//       console.error("Initial parse failed:", err.message);
//     } else {
//       console.error("Initial parse failed:", err);
//     }
//     return [];
//   }

//   const cleaned = parsed.map((entry: any) => {
//     const question = entry.question || "";
//     const explanation = entry.explanation || "";
//     const answer = entry.answer || "";

//     // Fix options: pick only strings and only 4 of them
//     let options = Array.isArray(entry.options)
//       ? entry.options.filter((opt: any) => typeof opt === 'string').slice(0, 4)
//       : [];

//     // Edge case: if explanation or junk is inside `options`, push it out
//     if (options.length > 4) options = options.slice(0, 4);

//     return {
//       question,
//       options,
//       answer,
//       explanation
//     };
//   });

//   return cleaned;
// }

export const AIService = {
  
  async generateMCQQuestions(params: {
    refined_text: string;
    difficulty: string;
    num_questions: number;
    topic_name: string;
    language?: string;
    exam_name?: string;
    subject?: string;
    Class:string;
  }) {
    try {
      const { refined_text, difficulty, num_questions, topic_name, language, exam_name,subject,Class } = params;
      console.log(refined_text, difficulty, num_questions, topic_name, language, exam_name);

      const numQuestionsNumber = Number(num_questions);
      const prompt = `Generate exactly ${numQuestionsNumber + 3} muliple choice questions (4 options each) for the subject='${subject}' topic='${topic_name}'  in language='${language}' with difficulty='${difficulty}' for class=${Class} .
      Questions, options, explanations string must be in perfect markdown format with equations in LaTeX format wrapped in proper $ signs.
      Do not include any additional text or explanations outside the JSON format.
      `;

      const response = await generateWithGemini(prompt);
      return response;
    } catch (error) {
      console.error('Error generating MCQ questions:', error);
      throw error;
    }
  },

  // Simulate the JSON processing similar to _process_response in your Python code
  async processResponse(response: string, num_questions: number): Promise<MCQQuestion[]> {
    try {
      const jsonStart = response.indexOf('[');
      const jsonEnd = response.lastIndexOf(']') + 1;

      if (jsonStart === -1 || jsonEnd === -1) {
        console.log('JSON content not found in response.');
        return [];
      }

      let jsonText = response.substring(jsonStart, jsonEnd);
      console.log('Cleaned JSON:', jsonText);

      const batchQuestions = JSON.parse(jsonText);

      const allGeneratedQuestions: MCQQuestion[] = [];

      for (const question of batchQuestions) {
        if (allGeneratedQuestions.length >= num_questions) {
          break;
        }

        const { question: questionText = '', options = [], answer = '', explanation = '' } = question;
        const renderables = [questionText, ...options, answer, explanation];
        const rendered = await Promise.all(renderables.map(text => renderMDX(text)));
        const [questionRendered, ...rest] = rendered;
        const optionsRendered = rest.slice(0, options.length).map(r => r.content);
        const answerRendered = rest[options.length]?.content || '';
        const explanationRendered = rest[options.length + 1]?.content || '';

        if (questionText && options.length === 4) {
          try {
            const answerIndex = options.indexOf(answer);
            question.question = questionRendered.content;
            question.options = optionsRendered;
            question.answer = answerIndex >= 0 ? answerIndex : -1;
            question.explanation = explanationRendered;
            allGeneratedQuestions.push({
              question: question.question,
              options: question.options,
              answer: question.answer,
              explanation: question.explanation
            });
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
  async getExam(examId: string): Promise<Exam> {
    const pb = await getPocketBase();
    return await pb.collection('exams').getOne(examId);
  },
  
  async getClientQuestions(examId: string): Promise<ClientQuestion[]> {
    const pb = await getPocketBase();
    const records = await pb.collection('questions').getFullList({
      filter: `exam_id = "${examId}"`,
    });
    
    return records.map(record => ({
      id: record.id,
      question_statement: record.question_statement,
      options: record.options
    }));
  },
  
  async getFullQuestions(examId: string): Promise<ServerQuestion[]> {
    const pb =await  getPocketBase();
    const records = await pb.collection('questions').getFullList({
      filter: `exam_id = "${examId}"`,
    });
    
    return records.map(record => ({
      id: record.id,
      question_statement: record.question_statement,
      options: record.options,
      correct_answer: record.correct_answer,
      explaination: record.explaination
    }));
  },
  
  async startExam(userExamId: string): Promise<void> {
    const pb =await getPocketBase();
    await pb.collection('user_exams').update(userExamId, {
      status: 'in_progress',
      start_time: new Date().toISOString()
    });
  },
  
  async getUserExam(userExamId: string): Promise<UserExam> {
    const pb = await getPocketBase();
    return await pb.collection('user_exams').getOne(userExamId);
  },
  
  async getExamStartTime(userExamId: string): Promise<number> {
    const pb = await getPocketBase();
    const userExam = await pb.collection('user_exams').getOne(userExamId);
    
    if (!userExam.start_time) {
      return Date.now(); // Default to now if not set
    }
    
    return new Date(userExam.start_time).getTime();
  },
  
  async getExamTimeLimit(examId: string): Promise<number> {
    const pb =await getPocketBase();
    const exam = await pb.collection('exams').getOne(examId);
    return exam.time_limit; // Returns time in minutes
  },
  
  async saveExamResult(
    userExamId: string, 
    score: number, 
    answers: { questionId: string, selectedAnswer: number }[]
  ): Promise<void> {
    const pb =await getPocketBase();
    
    // Update user exam record
    await pb.collection('user_exams').update(userExamId, {
      status: 'completed',
      score: score,
      end_time: new Date().toISOString()
    });
    
    // Save user answers
    for (const answer of answers) {
      await pb.collection('user_answers').create({
        user_exam_id: userExamId,
        question_id: answer.questionId,
        selected_answer: answer.selectedAnswer
      });
    }
  },
  
  async calculateExamResults(
    userExamId: string, 
    examId: string, 
    answers: { questionId: string, selectedAnswer: number }[]
  ): Promise<ExamResult> {
    const pb = getPocketBase();
    
    // Get all questions for this exam
    const questions = await this.getFullQuestions(examId);
    
    // Calculate results
    let correctAnswers = 0;
    const resultQuestions = questions.map(question => {
      const userAnswer = answers.find(a => a.questionId === question.id)?.selectedAnswer ?? -1;
      const isCorrect = userAnswer === question.correct_answer;
      
      if (isCorrect) correctAnswers++;
      
      return {
        id: question.id,
        question_statement: question.question_statement,
        options: question.options,
        userAnswer: userAnswer,
        correctAnswer: question.correct_answer,
        explanation: question.explaination
      };
    });
    
    const score = questions.length > 0 
      ? (correctAnswers / questions.length) * 100 
      : 0;
    
    return {
      score,
      totalQuestions: questions.length,
      correctAnswers,
      questions: resultQuestions
    };
  },
  
  async getUserAnswers(userExamId: string): Promise<UserAnswer[]> {
    const pb =await getPocketBase();
    const records = await pb.collection('user_answers').getFullList({
      filter: `user_exam_id = "${userExamId}"`,
    });
    
    return records.map(record => ({
      id: record.id,
      user_exam_id: record.user_exam_id,
      question_id: record.question_id,
      selected_answer: record.selected_answer
    }));
  }
};