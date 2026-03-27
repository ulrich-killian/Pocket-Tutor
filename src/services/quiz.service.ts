// services/quiz.ts

import api from './api';
import type {
  GenerateQuizPayload,
  GenerateQuizResponse,
  SubmitQuizPayload,
  SubmitQuizResponse,
} from '../types/quiz.type';

/**
 * Generate a quiz for a given document.
 *
 * @example
 * const quiz = await generateQuiz({
 *   documentId: 'cc2b20ff-...',
 *   userId: 'db677394-...',
 *   questionCount: 5,
 *   educationLevel: 'UpperSixth',
 * });
 */
export async function generateQuiz(
  payload: GenerateQuizPayload,
): Promise<GenerateQuizResponse> {
  const response = await api.post<GenerateQuizResponse>('/quiz/generate', {
    documentId: payload.documentId,
    userId: payload.userId,
    questionCount: payload.questionCount ?? 5,
    educationLevel: payload.educationLevel ?? 'UpperSixth',
  });
  return response.data;
}

/**
 * Submit answers and get back the score + bloom breakdown.
 *
 * Build the answers array from the questions returned by generateQuiz
 * and the student's selected option for each one.
 *
 * @example
 * const result = await submitQuiz({
 *   answers: [
 *     {
 *       questionId: 'q1',
 *       answer: 'A. GCE, Baccalauréat, HND, and BSc',   // student pick
 *       correctAnswer: 'A. GCE, Baccalauréat, HND, and BSc',
 *       bloomLevel: 'L1',
 *       explanation: '...',
 *     },
 *   ],
 * });
 */
export async function submitQuiz(
  payload: SubmitQuizPayload,
): Promise<SubmitQuizResponse> {
  const response = await api.post<SubmitQuizResponse>('/quiz/submit', {
    answers: payload.answers,
  });
  return response.data;
}
