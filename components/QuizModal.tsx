import React, { useState } from 'react';
import { QuizQuestion } from '../types';

interface QuizModalProps {
  question: QuizQuestion;
  onAnswer: (isCorrect: boolean) => void;
  isLoading: boolean;
}

const QuizModal: React.FC<QuizModalProps> = ({ question, onAnswer, isLoading }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedOption(index);
    setShowResult(true);
    
    // Delay reporting back to parent to show the animation
    setTimeout(() => {
      onAnswer(index === question.correctIndex);
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-lg w-full flex flex-col items-center animate-pulse">
           <div className="text-2xl mb-4">🤖</div>
           <p className="text-base md:text-lg font-bold text-gray-700">문제를 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full border-4 border-yellow-400 max-h-[90vh] overflow-y-auto">
        <div className="bg-yellow-400 p-3 md:p-4 sticky top-0 z-10">
          <h2 className="text-lg md:text-2xl font-jua text-white text-center drop-shadow-md">
            도시 상식 퀴즈!
          </h2>
        </div>
        
        <div className="p-4 md:p-6">
          <p className="text-base md:text-xl font-bold mb-4 md:mb-6 text-gray-800 leading-relaxed">
            Q. {question.question}
          </p>

          <div className="grid gap-2 md:gap-3">
            {question.options.map((option, idx) => {
              let btnClass = "w-full text-left p-3 md:p-4 rounded-lg border-2 transition-all font-medium text-sm md:text-lg ";
              
              if (showResult) {
                if (idx === question.correctIndex) {
                  btnClass += "bg-green-100 border-green-500 text-green-700";
                } else if (idx === selectedOption) {
                  btnClass += "bg-red-100 border-red-500 text-red-700";
                } else {
                  btnClass += "bg-gray-50 border-gray-200 text-gray-400";
                }
              } else {
                btnClass += "bg-white border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-700";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={btnClass}
                  disabled={showResult}
                >
                  <span className="inline-block w-5 md:w-6 font-bold">{idx + 1}.</span> {option}
                </button>
              );
            })}
          </div>

          {showResult && (
            <div className={`mt-4 md:mt-6 p-3 md:p-4 rounded-lg text-center font-bold text-base md:text-lg animate-bounce ${selectedOption === question.correctIndex ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {selectedOption === question.correctIndex ? "정답입니다! (+300구름)" : "아쉽네요! 다음 기회에..."}
              <div className="text-xs md:text-sm font-normal mt-2 text-gray-600 text-left md:text-center">
                해설: {question.explanation}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;