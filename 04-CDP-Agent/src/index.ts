import { CdpClient } from "@coinbase/cdp-sdk";
import { createPublicClient, http, parseEther } from "viem";
import { baseSepolia } from "viem/chains";
import dotenv from "dotenv";

dotenv.config();

// Initialize the CDP Client.
// This automatically picks up your API Key and Wallet Secret from environment variables.
const cdp = new CdpClient();

// The hardcoded address that will receive the payment.
const RECEIVER_ADDRESS = "0x4252e0c9A3da5A2700e7d91cb50aEf522D0C6Fe8";

async function main() {
  console.log("🚀 Starting the CDP Wallet v2 demo...");

  // ================================================
  // 1. Create a secure sender wallet
  // ================================================
  const sender = await cdp.evm.getOrCreateAccount({ name: "Demo-Sender-Wallet-1" });
  console.log(`✅ Sender account created: ${sender.address}`);

  // ================================================
  // 2. Request testnet funds for the sender
  // ================================================
  const { transactionHash: faucetTxHash } = await cdp.evm.requestFaucet({
    address: sender.address,
    network: "base-sepolia",
    token: "eth",
  });
  console.log(`💸 Requesting funds... Faucet TX: https://sepolia.basescan.org/tx/${faucetTxHash}`);

  // Wait for the faucet transaction to be confirmed on-chain
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });
  await publicClient.waitForTransactionReceipt({ hash: faucetTxHash });
  console.log("💰 Funds received!");

  // ================================================
  // 3. Send a transaction with the native function
  // ================================================
  const { transactionHash: transferTxHash } = await sender.transfer({
    to: RECEIVER_ADDRESS,
    amount: parseEther("0.00001"), // 0.00001 ETH
    token: "eth",
    network: "base-sepolia",
  });
  console.log(`📤 Transaction sent! Final TX: https://sepolia.basescan.org/tx/${transferTxHash}`);

  // Wait for the transfer to be confirmed
  await publicClient.waitForTransactionReceipt({ hash: transferTxHash });
  console.log("🎉 Transaction confirmed!");
}

main().catch((error) => {
  console.error("An error occurred:", error);
  process.exit(1);
});