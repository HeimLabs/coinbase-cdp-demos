import { CdpClient } from "@coinbase/cdp-sdk";
import axios from "axios";
import dotenv from "dotenv";
import { encodeFunctionData } from "viem";

// Load environment variables
dotenv.config();

// Validate required environment variables
if (
  !process.env.CDP_API_KEY_ID ||
  !process.env.CDP_API_KEY_SECRET ||
  !process.env.CDP_WALLET_SECRET ||
  !process.env.CDP_CLIENT_API_KEY
) {
  console.error("❌ ERROR: Missing required environment variable!");
  console.error(
    "Please ensure CDP_API_KEY_ID, CDP_API_KEY_SECRET, CDP_WALLET_SECRET, and CDP_CLIENT_API_KEY are set in your .env file"
  );
  process.exit(1);
}

// Initialize the CDP Client
const cdp = new CdpClient();
console.log("🚀 CDP Client Initialized.");

// OFFICIAL Base Mainnet USDC Contract Address
const USDC_CONTRACT_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";

// CDP SQL API Endpoint
const CDP_API_URL = "https://api.cdp.coinbase.com/platform/v2/data/query/run";

// A minimal ABI for the ERC-20 transfer function
const erc20Abi = [
  {
    name: "transfer",
    type: "function",
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    outputs: [{ type: "boolean" }],
    stateMutability: "nonpayable",
  },
] as const;

// Type definition for EVM Account
interface EvmAccount {
  address: string;
  name?: string;
}

/**
 * Provisions a new EVM account managed by CDP or retrieves an existing one.
 */
async function provisionAccount(name: string): Promise<EvmAccount> {
    try {
      console.log(`[Provisioner] Checking for account named '${name}'...`);
      const account = await cdp.evm.getOrCreateAccount({ name });
      console.log(
        `[Provisioner] ✅ Account '${name}' ready at address: ${account.address}`
      );
      return account;
    } catch (error) {
      console.error(
        `[Provisioner] ❌ Failed to provision account '${name}':`,
        error
      );
      throw error;
    }
}

/**
 * Queries the CDP SQL API to find new USDC transfers to our receiver address.
 * Uses the base.events table to query Transfer events
 */
async function checkForNewPayments(
    receiverAddress: string,
    lastCheckedTimestamp: string
  ): Promise<any[]> {
    // Query the base.events table for Transfer events
    // Using parameter access pattern: parameters['field']::Type
    const sql = `
      SELECT
    transaction_hash,
    parameters['from']::String AS from_address,
    parameters['to']::String AS to_address,
    parameters['value']::UInt256 AS value,
    block_timestamp
  FROM
    base.events
  WHERE
    event_signature = 'Transfer(address,address,uint256)'
    AND address = LOWER('${USDC_CONTRACT_ADDRESS}')
    AND LOWER(parameters['to']::String) = LOWER('${receiverAddress}')
    AND block_timestamp > '${lastCheckedTimestamp}'
  ORDER BY
    block_timestamp ASC
  LIMIT 100
    `;
  
    try {
      const headers = {
        Authorization: `Bearer ${process.env.CDP_CLIENT_API_KEY}`,
        "Content-Type": "application/json",
      };
  
      const response = await axios.post(CDP_API_URL, { sql }, { headers });
  
      if (response.data && response.data.result) {
        const resultCount = response.data.result.length;
        if (resultCount > 0) {
          console.log(`[SQL API] Found ${resultCount} new payment(s)`);
        }
        return response.data.result;
      }
  
      return [];
    } catch (error: any) {
      if (error.response) {
        console.error("[SQL API] ❌ Error response:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else if (error.request) {
        console.error("[SQL API] ❌ No response received");
      } else {
        console.error("[SQL API] ❌ Error:", error.message);
      }
      return [];
    }
}

/**
 * Uses the Token Balances API to check and report the treasury's USDC balance.
 */
async function reportTreasuryBalance(treasury: EvmAccount): Promise<void> {
    try {
      const response = await cdp.evm.listTokenBalances({
        address: treasury.address as `0x${string}`,
        network: "base",
      });
  
      // Find USDC balance in the response
      const usdcBalance = response.balances.find(
        (b: any) =>
          b.token.contractAddress?.toLowerCase() ===
          USDC_CONTRACT_ADDRESS.toLowerCase()
      );
  
      if (usdcBalance) {
        // USDC has 6 decimals
        const amount =
          Number(BigInt(usdcBalance.amount.amount) / BigInt(1e4)) / 100;
        console.log(
          `[Reporter] 💰 Treasury Balance: ${amount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })} USDC`
        );
      } else {
        console.log(`[Reporter] 💰 Treasury Balance: $0.00 USDC`);
      }
    } catch (error: any) {
      console.error(
        "[Reporter] ❌ Error fetching treasury balance:",
        error.message || error
      );
    }
}

/**
 * Sends the calculated platform fee from the receiver wallet to the treasury wallet.
 */
async function sendFeeTransaction(
    receiverAccount: EvmAccount,
    treasuryAddress: string,
    feeAmount: bigint
  ): Promise<string | undefined> {
    try {
      // Convert to human-readable amount for logging (USDC has 6 decimals)
      const humanAmount = Number(feeAmount) / 1e6;
      console.log(
        `[Reactor] Forwarding fee of ${humanAmount.toFixed(
          6
        )} USDC to treasury...`
      );
  
      // Create the transaction data for ERC-20 transfer
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [treasuryAddress as `0x${string}`, feeAmount],
      });
  
      // Send the transaction using CDP SDK
      const result = await cdp.evm.sendTransaction({
        address: receiverAccount.address as `0x${string}`,
        network: "base",
        transaction: {
          to: USDC_CONTRACT_ADDRESS,
          value: 0n, // No ETH value for token transfer
          data: data,
        },
      });
  
      console.log(
        `[Reactor] ✅ Fee transaction sent! Hash: https://basescan.org/tx/${result.transactionHash}`
      );
      return result.transactionHash;
    } catch (error: any) {
      console.error(
        "[Reactor] ❌ Failed to send fee transaction:",
        error.message || error
      );
  
      // Check if it's a gas-related error
      if (
        error.message?.includes("gas") ||
        error.message?.includes("insufficient")
      ) {
        console.error(
          "[Reactor] 💡 Hint: Ensure the receiver account has enough ETH for gas fees"
        );
      }
  
      return undefined;
    }
}

/**
 * Main function to run the autonomous payment bot
 */
async function main() {
    console.log("--- 🏁 Starting Onchain Agent ---");
    console.log(`📅 Current time: ${new Date().toISOString()}`);
  
    try {
      // 1. Provision the wallets our agent will use
      const receiverAccount = await provisionAccount("payment-receiver-bot");
      const treasuryAccount = await provisionAccount("platform-treasury-bot");
  
      // 2. CRITICAL WARNING
      console.log(
        "\n❗️❗️ WARNING: THIS AGENT OPERATES ON BASE MAINNET WITH REAL FUNDS ❗️❗️"
      );
      console.log("⚠️  Please ensure the following before starting:");
      console.log("   1. Fund the receiver with ETH for gas fees");
      console.log("   2. Test with small amounts first");
      console.log("   3. Monitor the addresses below:\n");
      console.log(`💰 Receiver Address: ${receiverAccount.address}`);
      console.log(`🏦 Treasury Address: ${treasuryAccount.address}`);
      console.log(
        "\nPress Ctrl+C to exit if you need to prepare the accounts first.\n"
      );
  
      // Initialize timestamp for payment tracking - SQL format
      let lastCheckedTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  
      // Test SQL API connectivity with a simple query
      console.log("--- 🔍 Testing SQL API Connectivity ---");
      const testSql = `
        SELECT COUNT(*) as count 
        FROM base.events 
        WHERE event_signature = 'Transfer(address,address,uint256)' 
        LIMIT 1
      `;
  
      try {
        const testResponse = await axios.post(
          CDP_API_URL,
          { sql: testSql },
          {
            headers: {
              Authorization: `Bearer ${process.env.CDP_CLIENT_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log(`[Test] ✅ SQL API connected successfully`);
      } catch (error: any) {
        console.error(
          "[Test] ❌ Failed to connect to SQL API:",
          error.response?.data || error.message
        );
        console.error(
          "Please check your CDP_CLIENT_API_KEY and ensure it has proper permissions"
        );
        process.exit(1);
      }
  
      // Loop 1: Check for new payments every 10 seconds
      console.log(
        "\n--- ⏰ Starting Payment Monitoring Loop (every 10 seconds) ---"
      );
      const paymentInterval = setInterval(async () => {
        try {
          const newPayments = await checkForNewPayments(
            receiverAccount.address,
            lastCheckedTimestamp
          );
  
          if (newPayments.length > 0) {
            console.log(
              `\n[Detector] 🎉 Found ${newPayments.length} new payment(s)!`
            );
  
            for (const payment of newPayments) {
              console.log(
                `[Detector] Processing payment from ${payment.from_address}`
              );
              console.log(
                `[Detector] Amount: ${BigInt(payment.value)} (smallest unit)`
              );
  
              const paymentValue = BigInt(payment.value);
              const feeValue = paymentValue / 20n; // Calculate 5% fee
  
              if (feeValue > 0n) {
                const txHash = await sendFeeTransaction(
                  receiverAccount,
                  treasuryAccount.address,
                  feeValue
                );
                if (txHash) {
                  console.log(
                    `[Reactor] Successfully processed fee for payment ${payment.transaction_hash}`
                  );
                }
              } else {
                console.log(`[Reactor] Payment amount too small to collect fee`);
              }
  
              // Update the timestamp to avoid reprocessing
              lastCheckedTimestamp = payment.block_timestamp;
            }
          } else {
            // Quiet log - only show periodically
            const now = new Date();
            if (now.getSeconds() % 30 === 0) {
              console.log(
                `[Monitor] Watching for new USDC payments... (${now.toLocaleTimeString()})`
              );
            }
          }
        } catch (error) {
          console.error("[Payment Loop] Error in payment monitoring:", error);
        }
      }, 10000);
  
      // Loop 2: Report treasury balance every 60 seconds
      console.log(
        "--- 📈 Starting Treasury Reporting Loop (every 60 seconds) ---"
      );
      const reportingInterval = setInterval(async () => {
        await reportTreasuryBalance(treasuryAccount);
      }, 60000);
  
      // Initial balance report
      await reportTreasuryBalance(treasuryAccount);
  
      // Graceful shutdown handler
      process.on("SIGINT", () => {
        console.log("\n\n--- 🛑 Shutting down gracefully ---");
        clearInterval(paymentInterval);
        clearInterval(reportingInterval);
        console.log("✅ All intervals cleared. Goodbye!");
        process.exit(0);
      });
    } catch (error: any) {
      console.error(
        "\n❌ Critical error during initialization:",
        error.message || error
      );
      process.exit(1);
    }
  }

// Run the main function
main().catch((error) => {
  console.error("\n❌ Unhandled error:", error);
  process.exit(1);
});