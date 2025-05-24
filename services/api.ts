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
// import { renderMDX } from '@/lib/mdx-remote';

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
export function cleanMalformedJson(raw: string): string {
  // Step 1: Replace equal signs with colons and fix field formatting
  let cleaned = raw
    .replace(/(\boptions)\s*=\s*/g, '"options": ')
    .replace(/(\banswer)\s*=\s*/g, '"answer": ')
    .replace(/(\bexplanation)\s*=\s*/g, '"explanation": ')
    .replace(/(\bquestion)\s*:\s*"/g, '"question": "');

  // Step 2: Ensure all property keys are quoted properly
  cleaned = cleaned.replace(/([{,])\s*(\w+)\s*:/g, '$1 "$2":');

  // Step 3: Fix any stray backslashes, remove line breaks within entries
  cleaned = cleaned.replace(/\\n/g, ' ').replace(/\s+/g, ' ');

  // Step 4: Wrap entire string in brackets if not already a valid array
  if (!cleaned.trim().startsWith('[')) {
    cleaned = `[${cleaned}]`;
  }

  // Step 5: Parse and re-stringify to ensure validity (optional)
  try {
    const parsed = JSON.parse(cleaned);
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    throw new Error("Cleaned JSON is still invalid: " + e);
  }
}


export const AIService = {

  async generateMCQQuestions(params: {
    refined_text: string;
    difficulty: string;
    num_questions: number;
    topic_name: string;
    language?: string;
    exam_name?: string;
    subject?: string;
    Class: string;
  }) {
    try {
      const { refined_text, difficulty, num_questions, topic_name, language, exam_name, subject, Class } = params;
      console.log(refined_text, difficulty, num_questions, topic_name, language, exam_name);

      const numQuestionsNumber = Number(num_questions);
      const prompt = `Generate exactly ${numQuestionsNumber + 3} multiple-choice questions (MCQs) for:
- subject = '${subject}'
- topic = '${topic_name}'
- class = '${Class}'
- difficulty = '${difficulty}'
- language = '${language}'

Follow these strict instructions:
1. Respond **only** with a JSON array (enclosed in []).
2. Each object must include exactly the following keys:
   - "question": A clear, direct question (no extra context or instructions).
   - "options": A list of exactly 4 distinct answer choices.
   - "answer": The correct answer as a **string**, exactly matching one of the options (not an index or label).
   - "explanation": A brief, concise explanation of why the answer is correct.
3. Do **not** include any additional text or formatting outside the JSON.
4. Do **not** prepend or append any commentary, headers, or markdown.
5. Do **not** add extra information to the question—keep it direct and academic.

Ensure the response is clean and parsable as valid JSON.`;

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
      // jsonText = cleanMalformedJson(jsonText)
      console.log('Cleaned JSON:', jsonText);

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
    const pb = await getPocketBase();
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
    const pb = await getPocketBase();
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
    const pb = await getPocketBase();
    const exam = await pb.collection('exams').getOne(examId);
    return exam.time_limit; // Returns time in minutes
  },

  async saveExamResult(
    userExamId: string,
    score: number,
    answers: { questionId: string, selectedAnswer: number }[]
  ): Promise<void> {
    const pb = await getPocketBase();

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
    const pb = await getPocketBase();
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