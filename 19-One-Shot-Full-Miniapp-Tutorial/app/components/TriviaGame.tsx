// app/components/TriviaGame.tsx
'use client';

import { useState } from 'react';
import { usePrimaryButton, useClose, useAddFrame, useMiniKit } from '@coinbase/onchainkit/minikit';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { useAccount } from 'wagmi';
import QuestionScreen from './QuestionScreen';
import ResultsScreen from './ResultsScreen';
import Leaderboard from './Leaderboard';
import { getTriviaQuestions, TriviaQuestion } from '@/lib/trivia-data';

export default function TriviaGame({ userFid, username }: { userFid: number, username: string }) {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results' | 'leaderboard'>('menu');
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  
  // MiniKit hooks for frame interactions
  const closeFrame = useClose(); // Allows closing the frame
  const addFrame = useAddFrame(); // Allows adding frame to Farcaster account
  const { context } = useMiniKit(); // Access to Farcaster user context
  const { isConnected } = useAccount(); // Wallet connection status
  const isAdded = Boolean(context?.client?.added); // Check if frame is saved to account

  // Configure the primary button at the bottom of the frame
  // This button dynamically changes based on game state
  usePrimaryButton(
    {
      text: gameState === 'playing' ? 'Skip Question' : 'Start Game',
    },
    () => {
      if (gameState === 'playing') {
        handleAnswer(false);
      } else {
        startNewGame();
      }
    }
  );

  const startNewGame = async () => {
    const newQuestions = await getTriviaQuestions();
    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setGameState('playing');
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(score + 20);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setGameState('results');
    }
  };

  const handleAddFrame = async () => {
    const result = await addFrame();
    if (result) {
      console.log('Frame added:', result);
      localStorage.setItem('notificationToken', result.token);
      localStorage.setItem('notificationUrl', result.url);
    }
  };

  if (gameState === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <h2 className="text-4xl font-bold text-white mb-4">Social Trivia</h2>
        <p className="text-gray-300 text-center mb-8">
          Test your knowledge and save your score onchain!
        </p>
        
        {/* Wallet Connection */}
        <div className="mb-6">
          <Wallet>
            <ConnectWallet className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2">
              <Avatar className="h-5 w-5" />
              <span>{isConnected ? <Name /> : 'Connect Wallet'}</span>
            </ConnectWallet>
            <WalletDropdown className="rounded-xl bg-gray-800 border border-gray-700">
              <WalletDropdownDisconnect className="hover:bg-gray-700" />
            </WalletDropdown>
          </Wallet>
        </div>
        
        <button
          onClick={startNewGame}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors"
        >
          Start Game
        </button>

        <button
          onClick={() => setGameState('leaderboard')}
          className="mt-4 text-blue-400 hover:text-blue-300"
        >
          View Leaderboard
        </button>
        
        {!isAdded && (
          <button
            onClick={handleAddFrame}
            className="mt-4 text-gray-400 hover:text-gray-300"
          >
            + Add to Favorites
          </button>
        )}
        
        <button
          onClick={closeFrame}
          className="mt-8 text-gray-500 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  if (gameState === 'playing' && questions.length > 0) {
    return (
      <QuestionScreen
        question={questions[currentQuestionIndex]}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <ResultsScreen
        score={score}
        totalQuestions={questions.length}
        userFid={userFid}
        username={username}
        onPlayAgain={startNewGame}
      />
    );
  }

  if (gameState === 'leaderboard') {
    return (
      <>
        <Leaderboard />
        <div className="p-6">
          <button
            onClick={() => setGameState('menu')}
            className="w-full py-3 bg-gray-700 text-white rounded-xl"
          >
            Back to Menu
          </button>
        </div>
      </>
    );
  }

  return null;
}