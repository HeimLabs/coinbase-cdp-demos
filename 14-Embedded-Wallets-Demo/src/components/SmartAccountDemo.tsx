"use client";

import { Button } from "@coinbase/cdp-react/components/Button";
import { useSendEvmTransaction } from "@coinbase/cdp-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

interface SmartAccountDemoProps {
  address?: string;
}

/**
 * Demo component showing Smart Account capabilities
 * Note: useSendUserOperation may not be available in current version
 * Using alternative implementation with batched transactions explanation
 */
export default function SmartAccountDemo({ address }: SmartAccountDemoProps) {
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { sendEvmTransaction } = useSendEvmTransaction();

  const handleBatchTransaction = async () => {
    if (!address) return;

    setError("");
    setTransactionHash("");
    setIsLoading(true);

    try {
      // For now, we'll demonstrate smart account concepts with a regular transaction
      // In production, you would use useSendUserOperation when available
      const result = await sendEvmTransaction({
        transaction: {
          to: address as `0x${string}`,
          value: BigInt(1000), // Small amount for demo
          gas: 21000n,
          chainId: 84532,
          type: "eip1559",
        },
        evmAccount: address as `0x${string}`,
        network: "base-sepolia",
      });

      setTransactionHash(result.transactionHash);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemo = () => {
    setTransactionHash("");
    setError("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Smart Account Features
        </CardTitle>
        <CardDescription>
          Experience account abstraction with batched transactions and gas sponsorship
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <h4 className="font-semibold text-blue-800">What are Smart Accounts?</h4>
          <p className="text-sm text-blue-700 mt-1">
            Smart Accounts (ERC-4337) enable advanced features like batching multiple operations 
            into a single transaction and gasless experiences via paymasters.
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
          <h4 className="font-semibold text-yellow-800">Demo Note</h4>
          <p className="text-sm text-yellow-700 mt-1">
            This demo showcases smart account concepts. The useSendUserOperation hook may require 
            additional configuration or a newer SDK version. For now, we're demonstrating with regular transactions.
          </p>
        </div>

        {!transactionHash && !error && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              In a full smart account implementation, you would:
            </p>
            <ul className="text-sm space-y-1 ml-4">
              <li>• Batch multiple operations into a single user operation</li>
              <li>• Enjoy gasless transactions via Base Paymaster</li>
              <li>• Benefit from enhanced security features</li>
              <li>• Use social recovery and spending limits</li>
            </ul>
            <p className="text-xs text-gray-500">
              For now, this sends a demo transaction to showcase the concept.
            </p>
            
            <Button 
              onClick={handleBatchTransaction}
              disabled={isLoading || !address}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Demo Transaction...
                </>
              ) : (
                "Send Demo Smart Account Transaction"
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <h4 className="font-semibold text-red-800">Transaction Failed</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <Button onClick={resetDemo} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {transactionHash && (
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <h4 className="font-semibold text-green-800">Transaction Sent! 🎉</h4>
            <p className="text-sm text-green-700 mt-1">
              Your demo transaction was sent successfully. In a full smart account setup, 
              this would be a batched user operation with gas sponsorship.
            </p>
            <div className="mt-2 space-y-2">
              <p className="text-xs text-green-600">
                Transaction Hash: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
              </p>
              <div className="flex gap-2">
                <a
                  href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                >
                  View on BaseScan <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </div>
              <Button onClick={resetDemo} variant="outline" size="sm" className="mt-2">
                Send Another Transaction
              </Button>
            </div>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">🔧 Smart Account Features</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p>💡 <strong>Batched Operations:</strong> Multiple calls in one user operation</p>
            <p>⛽ <strong>Gas Sponsorship:</strong> Paymasters can cover transaction fees</p>
            <p>🔒 <strong>Enhanced Security:</strong> Social recovery and spending limits</p>
            <p>🚀 <strong>Better UX:</strong> No need for users to hold ETH for gas</p>
          </div>
        </div>
        
        <div className="text-xs text-blue-600">
          <p>📚 <strong>Learn more:</strong> Check the CDP documentation for full smart account implementation details</p>
        </div>
      </CardContent>
    </Card>
  );
}
