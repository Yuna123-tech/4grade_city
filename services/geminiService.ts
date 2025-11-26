
import { QuizQuestion } from "../types";
import { QUIZ_POOL } from "../constants";

export const generateQuizQuestion = async (): Promise<QuizQuestion> => {
  // Simulate a short network delay for better UX feeling
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Pick a random question from the pool
  const randomIndex = Math.floor(Math.random() * QUIZ_POOL.length);
  return QUIZ_POOL[randomIndex];
};
