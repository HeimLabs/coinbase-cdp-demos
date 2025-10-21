// app/components/Leaderboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useViewProfile } from '@coinbase/onchainkit/minikit';

interface LeaderboardEntry {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
  score: number;
  rank: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const viewProfile = useViewProfile();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    // Mock data with Farcaster-style data
    setEntries([
      { 
        fid: 1, 
        username: 'alice', 
        displayName: 'Alice', 
        pfpUrl: 'https://i.imgur.com/default1.png', // mock URL
        score: 95, 
        rank: 1 
      },
      { 
        fid: 2, 
        username: 'bob', 
        displayName: 'Bob Builder', 
        pfpUrl: 'https://i.imgur.com/default2.png', // mock URL
        score: 87, 
        rank: 2 
      },
      { 
        fid: 3, 
        username: 'charlie', 
        displayName: 'Charlie', 
        score: 76, 
        rank: 3 
      },
    ]);
  };

  const handleViewProfile = (fid: number) => {
    viewProfile(fid);
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Leaderboard</h2>
      
      <div className="space-y-2">
        {entries.map((entry) => (
          <button
            key={entry.fid}
            onClick={() => handleViewProfile(entry.fid)}
            className="w-full flex items-center gap-3 p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
          >
            {/* Rank with emoji for top 3 */}
            <div className="w-8 text-center">
              {entry.rank <= 3 ? (
                <span className="text-2xl">{getRankEmoji(entry.rank)}</span>
              ) : (
                <span className="text-gray-400 font-semibold">#{entry.rank}</span>
              )}
            </div>
            
            {/* Profile Picture or Default Avatar */}
            {entry.pfpUrl ? (
              <img 
                src={entry.pfpUrl} 
                alt={entry.displayName || entry.username}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {(entry.displayName || entry.username || '?')[0].toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Name and Username */}
            <div className="flex-1 text-left">
              <div className="text-white font-semibold">
                {entry.displayName || entry.username || `User ${entry.fid}`}
              </div>
              {entry.username && (
                <div className="text-xs text-gray-400">@{entry.username}</div>
              )}
            </div>
            
            {/* Score */}
            <div className="text-right">
              <div className="text-xl font-bold text-white">{entry.score}</div>
              <div className="text-xs text-gray-400">points</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}