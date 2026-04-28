// types/quiz.ts

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  bloomLevel: 'L1' | 'L2' | 'L3' | 'L4' | 'L5' | 'L6';
  explanation: string;
}

export interface GenerateQuizResponse {
  documentId: string;
  questions: QuizQuestion[];
  totalQuestions: number;
}

export interface GenerateQuizPayload {
  documentId: string;
  userId: string;
  questionCount?: number;
  educationLevel?:
    | 'Form4'
    | 'Form5'
    | 'LowerSixth'
    | 'UpperSixth'
    | 'HND1'
    | 'HND2'
    | 'BSc';
}

export interface SubmitQuizAnswer {
  questionId: string;
  answer: string;
  correctAnswer: string;
  bloomLevel: string;
  explanation: string;
}

export interface SubmitQuizPayload {
  answers: SubmitQuizAnswer[];
}

export interface QuizResult {
  questionId: string;
  correct: boolean;
  correctAnswer: string;
  studentAnswer: string;
  explanation: string;
}

export interface SubmitQuizResponse {
  score: number;
  total: number;
  percentage: number;
  bloomBreakdown: Record<string, { correct: number; total: number }>;
  results: QuizResult[];
}
