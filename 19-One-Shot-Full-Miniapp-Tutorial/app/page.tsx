// app/page.tsx
// ⚠️ SECURITY CRITICAL:
// The context object is for display and personalization ONLY.
// It is unverified and must not be used to authorize actions on your backend.
// For secure actions, you must use the useAuthenticate hook.
"use client";

import { useEffect } from "react";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import AppLayout from "./components/AppLayout";
import TriviaGame from "./components/TriviaGame";

/**
 * Main App Component - Entry point for the Social Trivia MiniApp
 * 
 * This component:
 * 1. Initializes the MiniKit frame
 * 2. Retrieves Farcaster user context for personalization
 * 3. Renders the app layout and trivia game
 */
export default function App() {
  // MiniKit hook provides frame lifecycle and Farcaster user context
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  
  // Extract user information from Farcaster context (for display only!)
  const userFid = context?.user?.fid; // Farcaster ID
  const username = context?.user?.username; // Farcaster username
  const pfpUrl = context?.user?.pfpUrl; // Profile picture URL
  const displayName = context?.user?.displayName; // Display name

  // Initialize the MiniKit frame when the component mounts
  // This signals to Farcaster that the frame is ready to display
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <AppLayout>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {userFid ? (
              <>
                {pfpUrl && (
                  <img
                    src={pfpUrl}
                    alt={displayName || username || 'User'}
                    className="h-10 w-10 rounded-full"
                  />
                )}
                <div>
                  <h1 className="text-xl font-bold text-white">
                    <span>{displayName || username || 'Anonymous'}</span>
                  </h1>
                </div>
              </>
            ) : (
              <h1 className="text-xl font-bold text-white">Social Trivia</h1>
            )}
          </div>
        </div>

        {/* Game */}
        <div className="flex-1">
          <TriviaGame userFid={userFid as number} username={username as string} />
        </div>
      </div>
    </AppLayout>
  );
}