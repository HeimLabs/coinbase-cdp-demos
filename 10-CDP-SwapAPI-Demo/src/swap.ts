
// This tutorial demonstrates the CDP SDK token swap functionality.
// It shows the recommended all-in-one pattern (Approach 1) in action,
// while Approach 2 (create-then-execute) will be included included for reference but commented out.
//
import 'dotenv/config';
import { CdpClient } from '@coinbase/cdp-sdk';
import { 
  parseUnits, 
  createPublicClient, 
  http, 
  erc20Abi,
  encodeFunctionData,
  formatEther,
  formatUnits,
  type Address,
} from 'viem';
import { base } from 'viem/chains';

// Network configuration
const NETWORK = "base"; // Base mainnet

// Create a viem public client for transaction monitoring
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Token definitions for the example (using Base mainnet token addresses)
const TOKENS = {
  WETH: {
    address: "0x4200000000000000000000000000000000000006" as Address,
    symbol: "WETH",
    decimals: 18,
    isNativeAsset: false
  },
  USDC: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
    symbol: "USDC",
    decimals: 6,
    isNativeAsset: false
  },
};

// Permit2 contract address is the same across all networks
const PERMIT2_ADDRESS: Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

// Create a CDP client
const cdp = new CdpClient();

/**
 * Handles token allowance check and approval if needed
 */
async function handleTokenAllowance(
  ownerAddress: Address, 
  tokenAddress: Address,
  tokenSymbol: string,
  fromAmount: bigint
): Promise<void> {
  // Check allowance before attempting the swap
  const currentAllowance = await getAllowance(
    ownerAddress, 
    tokenAddress,
    tokenSymbol
  );
  
  // If allowance is insufficient, approve tokens
  if (currentAllowance < fromAmount) {
    console.log(`\n🔐 Allowance insufficient. Current: ${formatEther(currentAllowance)}, Required: ${formatEther(fromAmount)}`);
    
    // Set the allowance to the required amount
    await approveTokenAllowance(
      ownerAddress,
      tokenAddress,
      PERMIT2_ADDRESS,
      fromAmount
    );
    console.log(`✅ Set allowance to ${formatEther(fromAmount)} ${tokenSymbol}`);
  } else {
    console.log(`\n✅ Token allowance sufficient: ${formatEther(currentAllowance)} ${tokenSymbol}`);
  }
}

/**
 * Handle approval for token allowance if needed
 */
async function approveTokenAllowance(
  ownerAddress: Address, 
  tokenAddress: Address, 
  spenderAddress: Address, 
  amount: bigint
) {
  console.log(`\n🔄 Approving token allowance...`);
  console.log(`  Token: ${tokenAddress}`);
  console.log(`  Spender (Permit2): ${spenderAddress}`);
  
  // Encode the approve function call
  const data = encodeFunctionData({
    abi: erc20Abi,
    functionName: 'approve',
    args: [spenderAddress, amount]
  });
  
  // Send the approve transaction
  const txResult = await cdp.evm.sendTransaction({
    address: ownerAddress,
    network: NETWORK,
    transaction: {
      to: tokenAddress,
      data,
      value: BigInt(0),
    },
  });
  
  console.log(`📋 Approval transaction hash: ${txResult.transactionHash}`);
  
  // Wait for approval transaction to be confirmed
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txResult.transactionHash,
  });
  
  console.log(`✅ Approval confirmed in block ${receipt.blockNumber}`);
  return receipt;
}

/**
 * Check token allowance for the Permit2 contract
 */
async function getAllowance(
  owner: Address, 
  token: Address,
  symbol: string
): Promise<bigint> {
  console.log(`\n🔍 Checking ${symbol} allowance to Permit2 contract...`);
  
  try {
    const allowance = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [owner, PERMIT2_ADDRESS]
    });
    
    console.log(`  Current allowance: ${formatEther(allowance)} ${symbol}`);
    return allowance;
  } catch (error) {
    console.error("Error checking allowance:", error);
    return BigInt(0);
  }
}

/**
 * Approach 1: All-in-one pattern (RECOMMENDED)
 * 
 * ✅ THIS IS THE APPROACH WE'RE EXECUTING
 * 
 * - Single function call
 * - Automatic quote creation and execution
 * - Built-in error handling
 * - Best for almost all use cases
 */
async function demonstrateApproach1(
  account: any,
  fromToken: typeof TOKENS.WETH,
  toToken: typeof TOKENS.USDC,
  fromAmount: bigint
) {
    console.log("\n📚 APPROACH 1: All-in-one Pattern (Recommended)");
  console.log("This approach handles everything in a single call.\n");

  try {
    console.log("🔄 Creating and executing swap in one call...");
    
    // This is the magic! One function call does it all
    const result = await account.swap({
      network: NETWORK,
      fromToken: fromToken.address,
      toToken: toToken.address,
      fromAmount,
      slippageBps: 100, // 1% slippage tolerance
    });

    console.log("\n✅ Swap submitted successfully!");
    console.log(`📋 Transaction hash: ${result.transactionHash}`);
    console.log("⏳ Waiting for confirmation...");

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: result.transactionHash,
    });
    console.log("\n🎉 Swap Transaction Confirmed!");
    console.log(`📦 Block number: ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed}`);
    console.log(`📊 Status: ${receipt.status === 'success' ? 'Success ✅' : 'Failed ❌'}`);
    console.log(`🔍 View on Basescan: https://basescan.org/tx/${result.transactionHash}`);
    
  } catch (error: any) {
    if (error.message?.includes("Insufficient liquidity")) {
      console.log("\n❌ Swap failed: Insufficient liquidity for this swap pair or amount.");
      console.log("💡 Try reducing the swap amount or using a different token pair.");
    } else {
      throw error;
    }
  }
}

/**
 * Main function demonstrating token swap
 * 
 * This tutorial shows the recommended all-in-one swap pattern (Approach 1).
 * Approach 2 (create-then-execute) will be included in the code for but is commented out during execution.
 */
async function main() {
    console.log(`🚀 CDP SDK Token Swap Tutorial - All-in-One Pattern`);
  console.log(`📍 Network: ${NETWORK}`);
  console.log(`⚠️  Make sure you have WETH tokens available for swapping!\n`);

  // Get or create an account to use for the swap
  const account = await cdp.evm.getOrCreateAccount({ name: "SwapTutorialAccount" });
  console.log(`✅ Using account: ${account.address}`);

  // Define tokens and amount
  const fromToken = TOKENS.WETH;
  const toToken = TOKENS.USDC;
  const swapAmount = "0.0004"; // 0.0004 WETH
  const fromAmount = parseUnits(swapAmount, fromToken.decimals);

  console.log(`\n💱 Planning to swap ${swapAmount} ${fromToken.symbol} for ${toToken.symbol}`);

  try {
    // First, handle token allowance (required for ERC20 tokens)
    if (!fromToken.isNativeAsset) {
      await handleTokenAllowance(
        account.address as Address, 
        fromToken.address,
        fromToken.symbol,
        fromAmount
      );
    }

    // Execute Approach 1 - the recommended all-in-one pattern
    await demonstrateApproach1(account, fromToken, toToken, fromAmount);
    
    // Approach 2
    // await demonstrateApproach2(account, fromToken, toToken, fromAmount);
    
    console.log("\n💡 Note: Check the code to see Approach 2 (create-then-execute pattern) for educational purposes.");
    
  } catch (error) {
    console.error("\n❌ Error in main execution:", error);
  }
}

/**
 * Approach 2: Create-then-execute pattern (Advanced)
 * This is an advanced pattern that allows more control over the swap process.
 * 
 * This approach is shown here to demonstrate the advanced pattern where you:
 * - First create a quote to inspect details
 * - Then execute the swap
 * - More control for complex scenarios
 * 
 * In production, Approach 1 (all-in-one) is recommended for 90% of use cases.
 */
async function demonstrateApproach2(
  account: any,
  fromToken: typeof TOKENS.WETH,
  toToken: typeof TOKENS.USDC,
  fromAmount: bigint
) {
     console.log("\n📚 APPROACH 2: Create-then-Execute Pattern (Advanced)");
  console.log("This approach gives you more control by separating quote creation and execution.\n");

  try {
    // Step 1: Create the swap quote
    console.log("📊 Step 1: Creating swap quote...");
    const swapQuote = await account.quoteSwap({
      network: NETWORK,
      fromToken: fromToken.address,
      toToken: toToken.address,
      fromAmount,
      slippageBps: 100, // 1% slippage tolerance
    });

     // Step 2: Check if liquidity is available
    if (!swapQuote.liquidityAvailable) {
      console.log("\n❌ Swap failed: Insufficient liquidity for this swap pair or amount.");
      return;
    }
    
    // Step 3: Inspect swap details before execution
    console.log("\n📋 Swap Quote Details:");
    console.log(`  Expected to receive: ${formatUnits(swapQuote.toAmount, toToken.decimals)} ${toToken.symbol}`);
    console.log(`  Minimum receive amount: ${formatUnits(swapQuote.minToAmount, toToken.decimals)} ${toToken.symbol}`);
    if (swapQuote.fees?.gasFee) {
      console.log(`  Estimated gas fee: ${formatEther(swapQuote.fees.gasFee.amount)} ${swapQuote.fees.gasFee.token}`);
    }

    // Step 4: Execute the swap (you have two options here)
    console.log("\n🚀 Step 2: Executing the swap...");
    
    // Option A: Using account.swap() with the pre-created swap quote
    const result = await account.swap({
      swapQuote: swapQuote,
    });
    
    // Option B: Using the swap quote's execute() method directly
    // const result = await swapQuote.execute();

    console.log("\n✅ Swap submitted successfully!");
    console.log(`📋 Transaction hash: ${result.transactionHash}`);
    console.log("⏳ Waiting for confirmation...");

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: result.transactionHash,
    });

    console.log("\n🎉 Swap Transaction Confirmed!");
    console.log(`📦 Block number: ${receipt.blockNumber}`);
    console.log(`⛽ Gas used: ${receipt.gasUsed}`);
    console.log(`📊 Status: ${receipt.status === 'success' ? 'Success ✅' : 'Failed ❌'}`);
    console.log(`🔍 View on Basescan: https://basescan.org/tx/${result.transactionHash}`);
    
  } catch (error: any) {
    console.error("\n❌ Error during swap:", error);
  }
}

// Run the main function
main().catch(console.error);