export interface MCQQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Exam {
  id: string;
  user_id: string;
  exam_name: string;
  input_text: string;
  difficulty: string;
  topic: string;
  type: string;
  time_limit: number;
  created: string;
}

export interface ClientQuestion {
  id: string;
  question_statement: string;
  options: string[];
}
export interface ServerQuestion extends ClientQuestion {
  correct_answer: number;
  explanation: string;
}

export interface UserExam {
  id: string;
  user_id: string;
  exam_id: string;
  status: 'pending' | 'completed' | 'in_progress';
  score?: number;
  start_time?: string;
  end_time?: string;
}

export interface ExamSubmission {
  userExamId: string; 
  answers: { questionId: string, selectedAnswer: number }[];
  timeSpent: number;
  clientTimeStamp: number;
}

export interface ExamResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  questions: {
    id: string;
    question_statement: string;
    options: string[];
    userAnswer: number;
    correctAnswer: number;
    explanation: string;
  }[];
}

export interface UserAnswer {
  id?: string;
  user_exam_id: string;
  question_id: string;
  selected_answer: number;
}

export interface MCQGenerationParams {
  refined_text: string;
  difficulty: string;
  num_questions: number;
  topic_name: string;
  language?: string;
  exam_name: string;
  time_limit: number; 
}