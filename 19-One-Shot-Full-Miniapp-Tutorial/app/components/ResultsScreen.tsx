// app/components/ResultsScreen.tsx
'use client';

import { useComposeCast } from '@coinbase/onchainkit/minikit';
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { baseSepolia } from 'viem/chains';
import { useAccount } from 'wagmi';
import { useCallback, useState } from 'react';

const LEADERBOARD_ABI = [
  {
    inputs: [{ internalType: "uint256", name: "score", type: "uint256" }],
    name: "addScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  userFid?: number;
  username?: string;
  onPlayAgain: () => void;
}

export default function ResultsScreen({
  score,
  totalQuestions,
  userFid,
  username,
  onPlayAgain,
}: ResultsScreenProps) {
  const { composeCast } = useComposeCast();
  const { isConnected } = useAccount();
  const [saved, setSaved] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    console.log('Transaction status:', status.statusName);
    if (status.statusName === 'success') {
      setSaved(true);
      const hash = status.statusData?.transactionReceipts?.at(-1)?.transactionHash;
      if (hash) setTxHash(hash);
    } else if (status.statusName === 'transactionLegacyExecuted') {
      const legacyHash = status.statusData?.transactionHashList?.at(-1);
      if (legacyHash) setTxHash(legacyHash);
    }
  }, []);

  const handleShare = () => {
    const shareUrl = `${process.env.NEXT_PUBLIC_URL}/share?score=${score}&user=${username || 'player'}`;
    
    composeCast({
      text: `I scored ${score}/100 in Social Trivia! 🎯 Can you beat me?`,
      embeds: [shareUrl],
    });
  };

  const percentage = Math.round((score / (totalQuestions * 20)) * 100);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <h2 className="text-3xl font-bold text-white mb-4">Game Over!</h2>
      <p className="text-5xl font-bold text-blue-500 mb-2">{score} Points</p>
      <p className="text-gray-300 mb-6">You got {percentage}% correct!</p>
      
      <div className="space-y-3 w-full max-w-sm">
        <button
          onClick={handleShare}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Share Result
        </button>
        
        {/* Show Transaction component if connected and not saved */}
        {isConnected && !saved && (
          <Transaction
            chainId={baseSepolia.id}
            calls={[{
              // Leaderboard contract on Base Sepolia for storing scores onchain
              address: "0x3f9F825af4d6B5058b4B06CE300325aD7449B835" as `0x${string}`,
              abi: LEADERBOARD_ABI,
              functionName: 'addScore',
              args: [BigInt(score)],
            }]}
            onStatus={handleOnStatus}
            isSponsored={true} // Gas-sponsored via Paymaster - users pay no gas fees!
          >
            {/* @ts-expect-error - TransactionButton is not a valid JSX element */}
            <TransactionButton 
              text="Save Score Onchain 🏆" 
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            />
            <TransactionStatus className="mt-2">
              <TransactionStatusLabel className="text-sm text-gray-300" />
              <TransactionStatusAction className="text-sm text-blue-400 hover:text-blue-300" />
            </TransactionStatus>
          </Transaction>
        )}

        {/* Show success message when saved */}
        {saved && (
          <div className="text-center p-3 bg-green-900/30 rounded-xl border border-green-600/30">
            <p className="text-green-400">✅ Score saved onchain!</p>
            {txHash && (
              <a 
                href={`https://sepolia.basescan.org/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block"
              >
                View transaction →
              </a>
            )}
          </div>
        )}

        {/* Show connect prompt if not connected */}
        {!isConnected && userFid && (
          <div className="text-center p-3 bg-gray-800 rounded-xl">
            <p className="text-sm text-gray-400">
              Connect wallet to save score onchain
            </p>
          </div>
        )}
        
        <button
          onClick={onPlayAgain}
          className="w-full py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}