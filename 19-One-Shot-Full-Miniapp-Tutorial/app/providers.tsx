// app/providers.tsx
"use client";

import { type ReactNode } from "react";
import { base } from "viem/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";

/**
 * Providers component wraps the entire app with OnchainKitProvider
 * This enables wallet connections, transactions, and MiniKit features
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      // API key from Coinbase Developer Platform (required)
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      // Chain configuration - using Base mainnet
      chain={base}
      // Project identifier for OnchainKit
      projectId={process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME} 
      // Enable MiniKit features for Farcaster frame integration
      miniKit={{ enabled: true }}
      config={{
        // Appearance settings for wallet components
        appearance: {
          mode: "auto", // Auto dark/light mode based on user preference
          name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
          logo: process.env.NEXT_PUBLIC_ICON_URL,
        },
        // Paymaster URL enables gas-sponsored transactions (optional)
        // Users won't pay gas fees if configured
        paymaster: process.env.NEXT_PUBLIC_PAYMASTER_URL,
      }}
    >
      {children}
    </OnchainKitProvider>
  );
}