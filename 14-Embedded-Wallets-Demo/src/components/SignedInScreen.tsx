"use client";

import { useEvmAddress, useIsSignedIn } from "@coinbase/cdp-hooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPublicClient, http, formatEther } from "viem";
import { baseSepolia } from "viem/chains";

import Header from "@/components/Header";
import UserBalance from "@/components/UserBalance";
import SmartAccountDemo from "@/components/SmartAccountDemo";
import TokenTransfer from "@/components/TokenTransfer";

/**
 * Create a viem client to access user's balance on the Base Sepolia network
 */
const client = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

/**
 * The Signed In screen - Simplified embedded wallet demo
 */
export default function SignedInScreen() {
  const { isSignedIn } = useIsSignedIn();
  const { evmAddress } = useEvmAddress();
  const [balance, setBalance] = useState<bigint | undefined>(undefined);

  const formattedBalance = useMemo(() => {
    if (balance === undefined) return undefined;
    return formatEther(balance);
  }, [balance]);

  const getBalance = useCallback(async () => {
    if (!evmAddress) return;
    try {
      const balance = await client.getBalance({
        address: evmAddress,
      });
      setBalance(balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  }, [evmAddress]);

  useEffect(() => {
    getBalance();
    const interval = setInterval(getBalance, 5000);
    return () => clearInterval(interval);
  }, [getBalance]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 CDP Embedded Wallets Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience passwordless authentication and smart account features
          </p>
        </div>

        {isSignedIn && evmAddress ? (
          <div className="space-y-8">
            {/* Wallet Overview */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Embedded Wallet</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
                  <div className="bg-gray-50 p-3 rounded-md font-mono text-sm">
                    {evmAddress}
                  </div>
                </div>
                <div>
                  <UserBalance balance={formattedBalance} />
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="font-medium">Connected to Base Sepolia</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  Get test ETH from the{" "}
                  <a
                    href="https://portal.cdp.coinbase.com/products/faucet"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Base Sepolia Faucet
                  </a>
                </p>
              </div>
            </div>

            {/* Core Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SmartAccountDemo address={evmAddress} />
              <TokenTransfer address={evmAddress} onSuccess={getBalance} />
            </div>

            {/* Benefits Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white p-8">
              <h2 className="text-2xl font-bold mb-4">✨ Embedded Wallets Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">🔐 Passwordless Authentication</h3>
                  <p className="text-blue-100 text-sm">
                    Sign in with email OTP - no seed phrases or browser extensions required
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🧠 Smart Account Ready</h3>
                  <p className="text-blue-100 text-sm">
                    Built-in support for ERC-4337 account abstraction features
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">⚡ Instant Setup</h3>
                  <p className="text-blue-100 text-sm">
                    Wallets are created instantly without any user friction
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">🛡️ Secure Infrastructure</h3>
                  <p className="text-blue-100 text-sm">
                    Built on Coinbase's trusted and secure wallet infrastructure
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-4">Loading your wallet...</p>
          </div>
        )}
      </main>
    </div>
  );
}
