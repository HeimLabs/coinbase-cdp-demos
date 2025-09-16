import axios from "axios";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// 1) Configuration
const CDP_CLIENT_API_KEY = process.env.CDP_CLIENT_API_KEY;
const API_URL = "https://api.cdp.coinbase.com/platform/v2/data/query/run";
const DEFAULT_USDC_BASE_ADDRESS = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // USDC on Base

if (!CDP_CLIENT_API_KEY) {
  throw new Error("Please set CDP_CLIENT_API_KEY in your .env file.");
}

// 2) Helper formatting functions
function formatNumberToCurrency(num) {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Format a UInt256-like token amount (BigInt/string) to an exact USDC string with 6 decimals
function formatUsdcExact(amount) {
  const value = typeof amount === "bigint" ? amount : BigInt(amount);
  const integerPart = value / 1000000n;
  const fractionalPart = value % 1000000n;
  const fractionalStr = fractionalPart.toString().padStart(6, "0");
  return `${integerPart.toString()}.${fractionalStr}`;
}

// 3) Low-level API request function
async function runSqlQuery(sqlQuery) {
  try {
    const headers = {
      Authorization: `Bearer ${CDP_CLIENT_API_KEY}`,
      "Content-Type": "application/json",
    };
    const payload = { sql: sqlQuery };
    console.log(`\nExecuting query:\n${sqlQuery.trim()}`);
    const response = await axios.post(API_URL, payload, { headers });
    return response.data;
  } catch (error) {
    const details = error?.response?.data ?? error.message;
    console.error("Error executing SQL query:", details);
    throw error;
  }
}

// 4) Demo: Fetch latest block on Base
async function runLatestBlockDemo() {
  const latestBlockQuery = `
    SELECT 
      block_number,
      block_hash,
      timestamp,
      miner,
      gas_used,
      transaction_count
    FROM base.blocks 
    ORDER BY block_number DESC 
    LIMIT 1
  `;

  try {
    const result = await runSqlQuery(latestBlockQuery);
    console.log("\n--- Latest Block on Base ---");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Failed to get latest block:", error.message);
  }
}

// 5) Demo: Whale watching - Top 5 largest USDC transfers from a recent sample
async function runWhaleWatchingDemo(limit = 10000, tokenAddress = DEFAULT_USDC_BASE_ADDRESS) {
  const whaleWatchingQuery = `
    SELECT 
      parameters['from']::String AS sender,
      parameters['to']::String AS recipient,
      parameters['value']::UInt256 AS amount
    FROM base.events
    WHERE 
      event_signature = 'Transfer(address,address,uint256)'
      AND address = '${tokenAddress}'
    LIMIT ${Number(limit)}
  `;

  try {
    const whaleResult = await runSqlQuery(whaleWatchingQuery);
    const allTransfers = Array.isArray(whaleResult?.result) ? whaleResult.result : [];

    if (allTransfers.length === 0) {
      console.log("No USDC transfers found in the selected window.");
      return;
    }

    const sortedTransfers = allTransfers.sort((a, b) => {
      const amountA = BigInt(a.amount);
      const amountB = BigInt(b.amount);
      if (amountB > amountA) return 1;
      if (amountB < amountA) return -1;
      return 0;
    });

    const top5 = sortedTransfers.slice(0, 5).map((transfer) => {
      const exact = formatUsdcExact(transfer.amount);
      const approxNumber = Number(BigInt(transfer.amount) / 1000000n);
      return {
        sender: transfer.sender,
        recipient: transfer.recipient,
        amount_raw: transfer.amount,
        usdc_exact: exact,
        usdc_formatted: `$${formatNumberToCurrency(approxNumber)} USDC`,
      };
    });

    console.log("\n--- Top 5 Largest USDC Transfers on Base (from recent sample) ---");
    console.log(
      JSON.stringify(
        {
          result: top5,
          metadata: {
            token_address: tokenAddress,
            total_transfers_fetched: allTransfers.length,
            sample_limit: Number(limit),
          },
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error("Failed whale watching query:", error.message);
  }
}

// 6) CLI entrypoint
// Usage:
//   node index.js                 # runs both demos
//   node index.js latest-block    # runs latest block demo only
//   node index.js whales [limit]  # runs whale watching with optional limit (default 10000)
async function main() {
  const [, , command, arg1] = process.argv;
  if (command === "latest-block") {
    await runLatestBlockDemo();
    return;
  }
  if (command === "whales") {
    const limit = Number.isFinite(Number(arg1)) ? Number(arg1) : 10000;
    await runWhaleWatchingDemo(limit);
    return;
  }
  await runLatestBlockDemo();
  await runWhaleWatchingDemo(10000);
}

main().catch((err) => console.error("Main function failed:", err));
