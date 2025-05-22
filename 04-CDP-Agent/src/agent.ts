import { CdpClient, EvmServerAccount, EvmSmartAccount } from "@coinbase/cdp-sdk";
import dotenv from "dotenv";
import axios from 'axios'; // For external API calls
import { 
  parseUnits,    // Converts human-readable token amount to atomic units
  encodeFunctionData, // Encodes smart contract function calls
  Hex,            // Type for hexadecimal strings
  createPublicClient, // For interacting with blockchain read operations
  http,           // Transport for viem public client
} from "viem";
import { baseSepolia } from "viem/chains"; // Chain definition for Base Sepolia
import cron from 'node-cron';

// Load environment variables from .env file into process.env
dotenv.config(); 

// Initialize the CDP client.
// If CDP_API_KEY_ID, CDP_API_KEY_SECRET, and CDP_WALLET_SECRET 
// are set in the environment (e.g., via .env and dotenv.config()),
// the CdpClient constructor can pick them up automatically.
const cdp = new CdpClient();

// Verify that the credentials were loaded (optional check, CdpClient might throw if not found)
if (!process.env.CDP_API_KEY_ID || !process.env.CDP_API_KEY_SECRET || !process.env.CDP_WALLET_SECRET) {
  console.error("CRITICAL: CDP API credentials were not found in environment variables. Ensure .env file is set up and dotenv.config() was called.");
  process.exit(1); // Exit if credentials are not loaded
}

console.log("CDP Client initialized successfully for Wallet API v2.");

// Viem public client for waiting for faucet transaction receipts
const viemPublicClient = createPublicClient({ chain: baseSepolia, transport: http() });

async function mainAgent() {
  console.log("Starting CDP Agent...");
  try {
    // 1. Provision an EOA to be the owner of our Smart Account
    const ownerEoa = await provisionEoaWallet(cdp);

    // 2. Provision a Smart Account using the EOA as owner
    const agentSmartAccount = await provisionSmartAccount(cdp, ownerEoa);

    // 3. Fund the Smart Account with Base Sepolia ETH
    await fundSmartAccountWithCdpFaucet(agentSmartAccount);

    console.log(`[Agent Scheduler] Smart Account ${agentSmartAccount.address} configured.`);
    console.log("[Agent Scheduler] Initializing price monitoring cron job...");

    // Schedule monitorPriceAndAct to run, for example, every minute
    // '* * * * *' means "every minute"
    cron.schedule('* * * * *', () => {
      console.log(`[Agent Cron] Triggering scheduled price check (${new Date().toISOString()}).`);
      monitorPriceAndAct(cdp, agentSmartAccount).catch(cronError => {
        console.error("[Agent Cron] Error during scheduled monitorPriceAndAct:", cronError);
      });
    });

    console.log("[Agent Scheduler] Price monitoring cron job scheduled to run every minute.");
    console.log("[Agent Scheduler] Agent is now running. Press Ctrl+C to stop.");

    // Keep the agent alive. In a real server, this might be handled by the server framework.
    // For a simple script, this creates a promise that never resolves.
    await new Promise(() => {});

  } catch (error) {
    console.error("Error in main agent setup:", error);
    process.exit(1); // Exit if setup fails
  }
}

mainAgent().catch(error => { // Ensure mainAgent is called to start
    console.error("CRITICAL: Agent failed to start.", error);
    process.exit(1);
});


/**
 * Provisions a new EVM EOA using the CDP SDK.
 */
async function provisionEoaWallet(cdpClient: CdpClient): Promise<EvmServerAccount> {
    console.log("[Agent Provision] Creating new EVM EOA...");
    const evmAccount = await cdpClient.evm.createAccount({ name: `AgentOwnerEOA-${Date.now()}` });
    console.log(`[Agent Provision] Owner EOA created: ${evmAccount.address}`);
    return evmAccount;
}

/**
 * Provisions a new EVM Smart Account using the CDP SDK.
 */
async function provisionSmartAccount(
    cdpClient: CdpClient,
    ownerEoaAccount: EvmServerAccount
  ): Promise<EvmSmartAccount> {
    if (!ownerEoaAccount) throw new Error("Owner EOA account required for Smart Account.");
    
    console.log(`[Agent Provision] Creating Smart Account with owner: ${ownerEoaAccount.address}...`);
    // Smart Accounts created via SDK are deployed on first UserOperation.
    // Network context is typically Base Sepolia or Base Mainnet.
    const smartAccount = await cdpClient.evm.createSmartAccount({
      owner: ownerEoaAccount,
      // networkId: "base-sepolia" // Often inferred, but can be specified
    });
    console.log(`[Agent Provision] Smart Account provisioned: ${smartAccount.address} (Owner: ${ownerEoaAccount.address})`);
    return smartAccount;
}

/**
 * Requests testnet ETH for a Smart Account from the CDP Faucet.
 */
async function fundSmartAccountWithCdpFaucet(smartAccount: EvmSmartAccount): Promise<void> {
    console.log(`[Agent Funding] Requesting Base Sepolia ETH for Smart Account ${smartAccount.address}...`);
    try {
      const { transactionHash } = await smartAccount.requestFaucet({
        network: "base-sepolia", // Specify network for the faucet call
        token: "eth",
      });
      console.log(`[Agent Funding] Faucet ETH request submitted. Tx Hash: ${transactionHash}`);
      console.log("[Agent Funding] Waiting for faucet transaction confirmation...");
      const faucetTxReceipt = await viemPublicClient.waitForTransactionReceipt({
        hash: transactionHash,
        timeout: 180_000 // Wait up to 3 minutes
      });
      if (faucetTxReceipt.status === 'success') {
        console.log(`[Agent Funding] Faucet ETH successfully credited to ${smartAccount.address}.`);
      } else {
        console.error(`[Agent Funding] Faucet ETH transaction for ${smartAccount.address} failed or reverted.`);
      }
    } catch (error: any) {
      // Handle cases where faucet might have rate limits or already funded
      if (error.message?.toLowerCase().includes('already requested faucet')) {
          console.warn(`[Agent Funding] Faucet ETH likely already requested/funded recently for ${smartAccount.address}.`);
      } else {
          console.error(`[Agent Funding] Error requesting faucet ETH for ${smartAccount.address}:`, error.message);
      }
    }
}

const PRICE_API_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';
const TARGET_PRICE_THRESHOLD = 2600; // Example: Trigger if ETH > $2600
let isActionInProgress = false;

/**
 * Monitors ETH price and triggers an onchain action if threshold is met.
 */
async function monitorPriceAndAct(cdpClient: CdpClient, agentSmartAccount: EvmSmartAccount) {
  if (isActionInProgress) {
    console.log(`[Agent Monitor] Action in progress, skipping check (${new Date().toISOString()}).`);
    return;
  }
  try {
    console.log(`[Agent Monitor] Checking ETH price (${new Date().toISOString()})...`);
    const response = await axios.get(PRICE_API_URL);
    const price = response.data?.ethereum?.usd;

    if (typeof price !== 'number') {
      console.error('[Agent Monitor] Invalid price data:', response.data);
      return;
    }
    console.log(`[Agent Monitor] Current ETH Price: $${price}`);

    if (price > TARGET_PRICE_THRESHOLD) {
      console.log(`[Agent Monitor] Price ($${price}) > Threshold ($${TARGET_PRICE_THRESHOLD}). Triggering action...`);
      isActionInProgress = true;
      try {
        await sendOnchainAction(agentSmartAccount, {
          triggerPrice: price,
          threshold: TARGET_PRICE_THRESHOLD
        });
        console.log("[Agent Monitor] Onchain action sequence initiated.");
      } catch (actionError: any) {
        console.error("[Agent Monitor] Error from sendOnchainAction:", actionError.message);
      } finally {
        // In a real app, sophisticated lock release based on tx finality. For demo, simple timeout.
        setTimeout(() => { 
          isActionInProgress = false; 
          console.log("[Agent Monitor] Action lock released after timeout.");
        }, 60000); // e.g., 1 min
      }
    } else {
      console.log('[Agent Monitor] Price below threshold. No action.');
    }
  } catch (error: any) {
    console.error('[Agent Monitor] Error fetching price:', error.message);
    isActionInProgress = false; // Reset lock if fetching fails
  }
}

const BASE_SEPOLIA_USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`; 
const TARGET_RECIPIENT_ADDRESS = "0xB207F0CE9D53DBFC5C7c2f36A8b00b3315464529" as `0x${string}`; 

const erc20TransferAbi = [{
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
    "name": "transfer", "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "nonpayable", "type": "function"
}] as const;

interface ActionContext { triggerPrice: number; threshold: number; }

/**
 * Sends a UserOperation to transfer USDC.
 */
async function sendOnchainAction(
  smartAccount: EvmSmartAccount,
  context: ActionContext
): Promise<any> {
  console.log(`[Agent Action] Constructing UserOp for SA: ${smartAccount.address} to transfer USDC.`);
  console.log(`  Trigger: Price $${context.triggerPrice} > Threshold $${context.threshold}`);

  // Get some USDC from the faucet
  console.log(`[Agent Action] Requesting Base Sepolia USDC for Smart Account ${smartAccount.address}...`);
  try {
    const { transactionHash: usdcFaucetTxHash } = await smartAccount.requestFaucet({
      network: "base-sepolia",
      token: "usdc",
    });
    console.log(`[Agent Action] Faucet USDC request submitted. Tx Hash: ${usdcFaucetTxHash}`);
    console.log("[Agent Action] Waiting for USDC faucet transaction confirmation...");
    const usdcFaucetTxReceipt = await viemPublicClient.waitForTransactionReceipt({
      hash: usdcFaucetTxHash,
      timeout: 180_000 // Wait up to 3 minutes
    });
    if (usdcFaucetTxReceipt.status === 'success') {
      console.log(`[Agent Action] Faucet USDC successfully credited to ${smartAccount.address}.`);
    } else {
      console.error(`[Agent Action] Faucet USDC transaction for ${smartAccount.address} failed or reverted.`);
      // Potentially return or throw here if USDC is critical for the next step
    }
  } catch (error: any) {
    if (error.message?.toLowerCase().includes('already requested faucet')) {
        console.warn(`[Agent Action] Faucet USDC likely already requested/funded recently for ${smartAccount.address}.`);
    } else if (error.message?.toLowerCase().includes('insufficient funds for gas')) {
        console.warn(`[Agent Action] Smart Account ${smartAccount.address} has insufficient ETH for gas to claim USDC. Please fund with ETH first.`);
        // Potentially return or throw here, as the subsequent transfer will likely fail
    } else {
        console.error(`[Agent Action] Error requesting faucet USDC for ${smartAccount.address}:`, error.message);
        // Potentially return or throw here
    }
  }

  const amountToSendAtomic = parseUnits("0.01", 6); // 0.01 USDC

  try {
    const callData = encodeFunctionData({
      abi: erc20TransferAbi,
      functionName: "transfer",
      args: [TARGET_RECIPIENT_ADDRESS, amountToSendAtomic]
    });

    console.log(`[Agent Action] Submitting UserOperation: Transfer 0.01 USDC to ${TARGET_RECIPIENT_ADDRESS}`);
    const userOperationResult = await smartAccount.sendUserOperation({
      network: "base-sepolia", // Specify network context for the UserOperation
      calls: [{
        to: BASE_SEPOLIA_USDC_ADDRESS,    // USDC contract
        value: 0n,                       // Not sending ETH in this call
        data: callData                   // Encoded transfer(address,uint256)
      }],
      // Optional: Gas Sponsorship via Paymaster
      // paymasterUrl: process.env.PAYMASTER_RPC_URL,
    });

    console.log(`[Agent Action] UserOperation submitted! UserOp Hash: ${userOperationResult.userOpHash}`);
    
    // Await onchain confirmation
    await waitForConfirmation(smartAccount, userOperationResult);

    return userOperationResult;
  } catch (error: any) {
    console.error("[Agent Action] Error sending UserOperation:", error.message, error.response?.data);
    return null;
  }
}

/**
 * Waits for a UserOperation to be confirmed on-chain using the EvmSmartAccount instance.
 */
async function waitForConfirmation(
    smartAccount: EvmSmartAccount,
    userOpResult: any
  ): Promise<any> { 
    if (!smartAccount || !userOpResult?.userOpHash) {
      throw new Error("Invalid args: smartAccount and userOpResult (with userOpHash) are required.");
    }
    
    const userOpHash = userOpResult.userOpHash;
    console.log(`[Agent Confirm] Waiting for UserOp (Hash: ${userOpHash}) for SA ${smartAccount.address}...`);
    
    try {
      // Use the waitForUserOperation method from the EvmSmartAccount instance
      const receipt: any = await smartAccount.waitForUserOperation({
        userOpHash: userOpHash,
        // 'network' is typically implicit to the smartAccount object's context.
      });
      
      console.log(`[Agent Confirm] UserOp (Hash: ${userOpHash}) confirmed!`);
      console.log(`  Included in Transaction Hash: ${receipt.transactionHash}`);
      console.log(`  Onchain Status: ${receipt.status}`); 
      
      if (receipt.status !== 'success') {
          console.warn(`[Agent Confirm] Underlying tx for UserOp ${userOpHash} may have failed/reverted.`);
      }
      return receipt;
    } catch (error: any) {
      console.error(`[Agent Confirm] Error waiting for UserOp (Hash: ${userOpHash}):`, error.message);
      throw error;
    }
}


