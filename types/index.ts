export interface MCQQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface Exam {
  exam_id?: string;
  exam_name: string;
  refined_text: string;
  difficulty: string;
  type: string;
  time_limit: number;
  created_at?: string;
}

export interface Question {
  question_id?: string;
  exam_id: string;
  question_statement: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface UserExam {
  user_exam_id?: string;
  user_id: string;
  exam_id: string;
  status: string;
  score?: number;
  completed_at?: string;
}

export interface TaskProgress {
  progress_id?: string;
  task_id: string;
  status: string;
  created_at: string;
}

export interface MCQGenerationParams {
  refined_text: string;
  difficulty: string;
  num_questions: number;
  exam_name: string;
  time_limit: number;
  topic_name: string;
}