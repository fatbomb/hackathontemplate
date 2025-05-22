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
export interface User {
  id: string;
  email: string;
  name: string;
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
  subject: string;
  Class: string;
}


//abrar

export interface EnvironmentalData {
  id: string;
  dataType: 'pollution' | 'biodiversity' | 'weather';
  value: string;
  notes?: string;
  latitude: number;
  longitude: number;
  created: string;
}

export interface LocationData {
  lat: number;
  lng: number;
}

export interface CloudFunctionData {
  dataType: string;
  value: string;
  location: {
    latitude: number;
    longitude: number;
  };
  recordId: string;
}