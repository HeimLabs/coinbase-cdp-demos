"use client";

import { Button } from "@coinbase/cdp-react/components/Button";
import { useSendEvmTransaction } from "@coinbase/cdp-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { useState } from "react";
import { parseEther } from "viem";
import { ExternalLink, Loader2, Send } from "lucide-react";

interface TokenTransferProps {
  address?: string;
  onSuccess?: () => void;
}

/**
 * Component for transferring ETH to any address
 */
export default function TokenTransfer({ address, onSuccess }: TokenTransferProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionHash, setTransactionHash] = useState("");
  const [error, setError] = useState("");

  const { sendEvmTransaction, isSending } = useSendEvmTransaction();

  const handleTransfer = async () => {
    if (!address || !recipient || !amount) return;

    setError("");
    setTransactionHash("");

    try {
      // Validate recipient address
      if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
        throw new Error("Invalid recipient address");
      }

      // Validate amount
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Invalid amount");
      }

      const result = await sendEvmTransaction({
        transaction: {
          to: recipient as `0x${string}`,
          value: parseEther(amount),
          gas: 21000n,
          chainId: 84532,
          type: "eip1559",
        },
        evmAccount: address as `0x${string}`,
        network: "base-sepolia",
      });

      setTransactionHash(result.transactionHash);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transfer failed");
    }
  };

  const resetForm = () => {
    setRecipient("");
    setAmount("");
    setTransactionHash("");
    setError("");
  };

  const handleQuickFill = () => {
    // Fill with the user's own address for demo purposes
    setRecipient(address || "");
    setAmount("0.0001");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Token Transfer
        </CardTitle>
        <CardDescription>
          Send ETH to any address on Base Sepolia
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!transactionHash && !error && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Amount (ETH)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.001"
                step="0.0001"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleQuickFill}
                variant="outline"
                size="sm"
              >
                Quick Fill (Send to Self)
              </Button>
            </div>

            <Button
              onClick={handleTransfer}
              disabled={isSending || !recipient || !amount}
              className="w-full"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send ETH"
              )}
            </Button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-400">
            <h4 className="font-semibold text-red-800">Transfer Failed</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <Button onClick={resetForm} variant="outline" className="mt-2">
              Try Again
            </Button>
          </div>
        )}

        {transactionHash && (
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
            <h4 className="font-semibold text-green-800">Transfer Successful! 🎉</h4>
            <p className="text-sm text-green-700 mt-1">
              Your ETH transfer has been sent successfully.
            </p>
            <div className="mt-2 space-y-2">
              <p className="text-xs text-green-600">
                Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
              </p>
              <a
                href={`https://sepolia.basescan.org/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
              >
                View on BaseScan <ExternalLink className="ml-1 h-3 w-3" />
              </a>
              <div className="pt-2">
                <Button onClick={resetForm} variant="outline" size="sm">
                  Send Another Transfer
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500">
          💡 Get testnet ETH from the{" "}
          <a
            href="https://portal.cdp.coinbase.com/products/faucet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Base Sepolia Faucet
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
