// app/components/QuestionScreen.tsx
'use client';

import { useState } from 'react';
import { TriviaQuestion } from '@/lib/trivia-data';
import { useOpenUrl } from '@coinbase/onchainkit/minikit';

interface QuestionScreenProps {
  question: TriviaQuestion;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean) => void;
}

export default function QuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
}: QuestionScreenProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const openUrl = useOpenUrl();

  const handleAnswer = (answerIndex: number) => {
    if (showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    const isCorrect = answerIndex === question.correctAnswer;
    
    setTimeout(() => {
      onAnswer(isCorrect);
      setSelectedAnswer(null);
      setShowResult(false);
    }, 1500);
  };

  const handleSourceClick = () => {
    if (question.source) {
      openUrl(question.source);
    }
  };

  return (
    <div className="flex flex-col p-6">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-300 mb-2">
          <span>Question {questionNumber}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <h3 className="text-xl font-bold text-white mb-6">{question.question}</h3>

      {/* Answers */}
      <div className="space-y-3">
        {question.answers.map((answer, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = index === question.correctAnswer;
          const showCorrect = showResult && isCorrect;
          const showWrong = showResult && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={showResult}
              className={`w-full p-4 rounded-xl text-left transition-all ${
                showCorrect
                  ? 'bg-green-600 text-white'
                  : showWrong
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
              }`}
            >
              {answer}
            </button>
          );
        })}
      </div>

      {/* Source Link - Using useOpenUrl */}
      {question.source && (
        <button
          onClick={handleSourceClick}
          className="mt-6 text-sm text-blue-400 hover:text-blue-300"
        >
          View Source
        </button>
      )}
    </div>
  );
}