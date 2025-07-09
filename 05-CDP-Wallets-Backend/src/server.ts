/**
 * Main server application for CDP Wallets Backend
 * Provides API endpoints for wallet management and transactions on Base Sepolia network
 * using Coinbase's CDP SDK and Viem for Ethereum interactions
 */

import express, { Express, Request, Response, RequestHandler } from 'express';
import dotenv from 'dotenv';
import { initializeCdpClient, getCdpClient } from './cdpClient.js';
import { viemPublicClient } from './viemClient.js';
import { isAddress } from 'viem';
import {
  parseEther,
  serializeTransaction,
  Hex,
  createPublicClient,
  http,
  TransactionReceipt,
  PublicClient,
  Chain,
} from 'viem';
import { baseSepolia } from 'viem/chains';

// Currently supporting only Base Sepolia network
type TransactionNetwork = 'base-sepolia';

/**
 * Mapping of supported networks to their Viem chain configurations
 */
const viemChainMap: Record<TransactionNetwork, Chain> = {
  'base-sepolia': baseSepolia,
};

/**
 * Represents the result of a batch transaction operation
 * @interface BatchTransactionResult
 */
interface BatchTransactionResult {
  recipient: string;
  submissionStatus: 'fulfilled' | 'rejected';
  txHash?: Hex | null;
  submissionError?: string | null;
  confirmationStatus: 'confirmed' | 'timeout_or_failed' | 'pending' | 'not_attempted';
  receipt?: TransactionReceipt | null;
  confirmationError?: string | null;
}

// Constants for retry mechanism
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

/**
 * Utility function to pause execution for a specified duration
 * @param ms - Duration to sleep in milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

dotenv.config();
initializeCdpClient(); // Initialize CDP Client at startup

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // Middleware to parse JSON bodies

/**
 * Represents a managed wallet in the system
 * @interface ManagedWallet
 */
interface ManagedWallet {
  /** Unique identifier from CDP */
  walletId: string;
  /** Ethereum address of the wallet */
  address: string;
  /** Network the wallet is deployed on */
  network: string;
  /** Optional display name */
  name?: string;
  /** Internal identifier for wallet ownership */
  assignedTo: string;
  /** ISO timestamp of wallet creation */
  createdAt: string;
  /** Optional identifier for user-specific wallets */
  userIdentifier?: string;
}

const managedWalletsStore: ManagedWallet[] = [];

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

// Helper function to sanitize names for CDP SDK
/**
 * Sanitizes input strings to be compatible with CDP SDK naming requirements
 * Rules:
 * 1. Only alphanumeric characters and hyphens allowed
 * 2. Must start and end with alphanumeric character
 * 3. Maximum length of 36 characters
 * 4. No consecutive hyphens
 * 
 * @param input - The string to sanitize
 * @returns A CDP-compatible name string
 */
function sanitizeForCdpName(input: string): string {
  // 1. Replace invalid characters with hyphen
  let sanitized = input.replace(/[^a-zA-Z0-9-]/g, '-');
  
  // 2. Replace multiple consecutive hyphens
  sanitized = sanitized.replace(/-+/g, '-');
  
  // 3. Remove leading/trailing hyphens
  sanitized = sanitized.replace(/^-+|-+$/g, '');
  
  // 4. Truncate to 36 chars
  if (sanitized.length > 36) {
    sanitized = sanitized.substring(0, 36).replace(/-+$/g, '');
  }

  // 5. Validate and provide fallback
  const cdpNameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,34}[a-zA-Z0-9])?$/;
  if (sanitized.length === 1 && /^[a-zA-Z0-9]$/.test(sanitized)) {
    return sanitized;
  } 
  
  if (!cdpNameRegex.test(sanitized) || sanitized.length === 0) {
    const timestamp = Date.now().toString();
    return `cdpw-${timestamp.substring(timestamp.length - 8)}`;
  }

  return sanitized;
}

// Helper function to recursively convert BigInts to strings in an object/array
/**
 * Recursively converts BigInt values to strings in objects and arrays
 * This is necessary for JSON serialization of responses containing BigInt values
 * 
 * @param obj - The object or value to process
 * @returns The processed object with BigInts converted to strings
 */
function stringifyBigInts(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(stringifyBigInts);
  }
  if (typeof obj === 'object') {
    const newObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = stringifyBigInts(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}

// Define the handler function for POST /wallets
const createWalletHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name: userNameInput, assignedTo, network = 'base-sepolia' } = req.body;

    if (!assignedTo) {
      res.status(400).json({ error: 'assignedTo is a required field.' });
      return;
    }

    // Construct the name for CDP SDK using sanitization
    let baseNameForCdp: string;
    if (userNameInput && typeof userNameInput === 'string' && userNameInput.trim() !== '') {
      baseNameForCdp = userNameInput;
    } else {
      baseNameForCdp = `wallet-for-${assignedTo}`;
    }
    const cdpApiName = sanitizeForCdpName(baseNameForCdp);

    console.log(`[server /wallets]: Original name input: "${userNameInput}", AssignedTo: "${assignedTo}", Sanitized CDP name for API: "${cdpApiName}"`);

    const cdpClient = getCdpClient();
    if (!cdpClient) {
      res.status(500).json({ error: 'CDP client not initialized.' });
      return;
    }

    const newAccount = await cdpClient.evm.createAccount({
      name: cdpApiName, // Use the sanitized name for CDP SDK
    });

    // Create a unique ID for the wallet
    const accountId = `${assignedTo}-${Date.now()}`;

    if (!newAccount || !newAccount.address || !accountId) {
      res.status(500).json({ error: 'Failed to create wallet account or received invalid response (missing address or id).' });
      return;
    }

    // Create ManagedWallet object
    const managedWallet: ManagedWallet = {
      walletId: accountId, // Using accountId obtained above
      address: newAccount.address,
      network: network,
      name: userNameInput, // Store the original user-provided name (if any)
      assignedTo: assignedTo,
      createdAt: new Date().toISOString(),
    };

    // Store it (in-memory for now)
    managedWalletsStore.push(managedWallet);

    console.log(`[server]: Wallet created: ${managedWallet.address} for ${assignedTo} on ${network}`);
    res.status(201).json(managedWallet);
    return;
  } catch (error) {
    console.error('[server]: Error creating wallet:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to create wallet.', details: errorMessage });
    return;
  }
};

// POST /wallets route using the defined handler
app.post('/wallets', createWalletHandler);

// POST /users/wallet route
const createUserWalletHandler: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.body;

    if (!username || typeof username !== 'string') {
      res.status(400).json({ error: 'username is a required string field.' });
      return;
    }

    // Construct the name for CDP SDK using sanitization
    const baseNameForCdp = `DAppUserWallet-${username}`;
    const cdpApiName = sanitizeForCdpName(baseNameForCdp);

    console.log(`[server /users/wallet]: Username: "${username}", Base CDP name: "${baseNameForCdp}", Sanitized CDP name for API: "${cdpApiName}"`);

    const cdpClient = getCdpClient();
    if (!cdpClient) {
      res.status(500).json({ error: 'CDP client not initialized.' });
      return;
    }

    const newAccount = await cdpClient.evm.createAccount({
      name: cdpApiName, // Use the sanitized name for CDP SDK
    });

    // Create a unique ID for the wallet
    const accountId = `${username}-${Date.now()}`;

    if (!newAccount || !newAccount.address || !accountId) {
      res.status(500).json({ error: 'Failed to create user wallet account or received invalid response (missing address or id).' });
      return;
    }

    const managedWallet: ManagedWallet = {
      walletId: accountId,
      address: newAccount.address,
      network: 'base-sepolia', // Defaulting to base-sepolia as per general pattern
      name: cdpApiName, // Store the sanitized CDP name as the wallet's display name here
      assignedTo: username, // Assign to the user
      userIdentifier: username, // Store the username as userIdentifier
      createdAt: new Date().toISOString(),
    };

    managedWalletsStore.push(managedWallet);

    console.log(`[server]: Wallet created for user ${username}: ${managedWallet.address} on ${managedWallet.network} with CDP name ${cdpApiName}`);
    res.status(201).json(managedWallet);

  } catch (error) {
    console.error('[server]: Error creating user wallet:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Failed to create user wallet.', details: errorMessage });
  }
};

app.post('/users/wallet', createUserWalletHandler);

// POST /wallets/:walletAddress/faucet
const requestFaucetHandler: RequestHandler = async (req: Request, res: Response) => {
  const { walletAddress } = req.params;
  const { network: networkParam, token: tokenParam } = req.body;
  const network = (networkParam || 'base-sepolia');
  const asset = (tokenParam || 'eth'); // Raw asset string from input or default

  console.log(`[API /faucet] Request for ${walletAddress} on ${network} to get ${asset}`);

  if (!isAddress(walletAddress)) { // Using isAddress from viem
    res.status(400).json({ error: 'Invalid wallet address.' });
    return;
  }

  if (network !== 'base-sepolia') { // More direct check since only one is allowed.
    res.status(400).json({ error: `Unsupported network for faucet: ${network}. This faucet API only supports 'base-sepolia'.` });
    return;
  }

  if (asset.toLowerCase() !== 'eth') {
    res.status(400).json({ error: 'CDP Faucet currently supports ETH only for EVM with this method.' });
    return;
  }

  const cdpClient = getCdpClient();
  if (!cdpClient) {
    res.status(500).json({ error: 'CDP client not initialized.' });
    return;
  }

  const managedWallet = managedWalletsStore.find(
    (w) => w.address.toLowerCase() === walletAddress.toLowerCase() && w.network.toLowerCase() === network.toLowerCase()
  );

  if (!managedWallet) {
    res.status(404).json({ error: `Wallet ${walletAddress} on ${network} not managed by this service.` });
    return;
  }

  try {
    console.log(`[server]: Requesting faucet for ${managedWallet.address} on ${network} with asset ${asset.toUpperCase()}`);
    
    const faucetResult = await cdpClient.evm.requestFaucet({
      address: managedWallet.address, 
      network: network, 
      token: asset,
    });

    if (!faucetResult || !faucetResult.transactionHash) {
      console.error('[API /faucet] Faucet request did not return a transaction hash.');
      res.status(500).json({ error: 'Faucet request did not return a transaction hash.'});
      return;
    }

    console.log(`[API /faucet] Faucet request for ${managedWallet.address} submitted. TxHash: ${faucetResult.transactionHash}`);
    console.log(`[API /faucet] Waiting for faucet tx ${faucetResult.transactionHash} confirmation...`);
    
    const receipt = await viemPublicClient.waitForTransactionReceipt({ 
      hash: faucetResult.transactionHash as `0x${string}`,
      timeout: 180_000 // 3 minutes timeout
    });
    
    if (receipt.status === 'success') {
      console.log(`[API /faucet] Faucet tx ${faucetResult.transactionHash} confirmed for ${managedWallet.address}.`);
      res.status(200).json({ 
        message: 'Faucet funds requested and confirmed.', 
        transactionHash: faucetResult.transactionHash, 
        receiptStatus: receipt.status 
      });
      return;
    } else {
      throw new Error(`Faucet transaction ${faucetResult.transactionHash} confirmed but reverted (status: ${receipt.status}).`);
    }
  } catch (error: any) {
    console.error(`[API /faucet] Error for ${walletAddress}:`, error.message);
    if (error.message?.toLowerCase().includes('already requested faucet') || 
        error.message?.toLowerCase().includes('limit exceeded') ||
        error.message?.toLowerCase().includes('rate limit')) {
        res.status(429).json({ error: 'Faucet funds likely already requested recently for this address or rate limit hit.', details: error.message });
        return;
    }
    if (error.name === 'InsufficientFundsError') {
        res.status(400).json({ error: 'Faucet has insufficient funds for the requested asset.', details: error.message });
        return;
    }
    if (error.name === 'UnsupportedFaucetAssetError') {
        res.status(400).json({ error: 'The requested asset is not supported by the faucet.', details: error.message });
        return;
    }
    res.status(500).json({ error: 'Failed to request or confirm faucet funds.', details: error.message });
    return;
  }
};

app.post('/wallets/:walletAddress/faucet', requestFaucetHandler);


app.post('/wallets/:walletAddress/send-batch-eth', async (req: Request, res: Response): Promise<void> => {
  const senderAddressParam = req.params.walletAddress;
  const { recipients, amountPerRecipient } = req.body as {
    recipients: string[];
    amountPerRecipient: string;
  };

  // 1. Validate inputs
  if (!isAddress(senderAddressParam)) {
    res.status(400).json({ message: 'Invalid sender address format.' });
    return;
  }
  if (!Array.isArray(recipients) || recipients.some(r => !isAddress(r))) {
    res.status(400).json({ message: 'Invalid recipients array or one or more recipient addresses are invalid.' });
    return;
  }
  if (typeof amountPerRecipient !== 'string' || isNaN(parseFloat(amountPerRecipient)) || parseFloat(amountPerRecipient) <= 0) {
    res.status(400).json({ message: 'Invalid amountPerRecipient. Must be a positive number string.' });
    return;
  }

  // 2. Find managed sender wallet
  const senderWallet = managedWalletsStore.find(
    w => w.address.toLowerCase() === senderAddressParam.toLowerCase() && w.network === 'base-sepolia'
  );

  if (!senderWallet) {
    res.status(404).json({ message: `Sender wallet ${senderAddressParam} not found on network base-sepolia.` });
    return;
  }

  // 3. Convert amount to Wei
  let amountWei: bigint;
  try {
    amountWei = parseEther(amountPerRecipient);
  } catch (error) {
    res.status(400).json({ message: 'Invalid amountPerRecipient format for parseEther.' });
    return;
  }

  // 4. Get Viem chain and create PublicClient
  const viemChain = viemChainMap['base-sepolia'];
  const publicClient: PublicClient = createPublicClient({
    chain: viemChain,
    transport: http(),
  });

  const cdp = getCdpClient();
  const results: BatchTransactionResult[] = [];

  // 5. Map recipients to an array of Promises for cdp.evm.sendTransaction
  console.log(`Preparing to send ${recipients.length} transactions...`);
  const submissionPromises = recipients.map(async (recipientAddress, index) => {
    const serializedTx = serializeTransaction({
      to: recipientAddress as Hex,
      value: amountWei,
      chainId: viemChain.id,
      type: 'eip1559',
    });

    let retryCount = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        console.log(`Attempting to send transaction #${index} to ${recipientAddress}`);
        
        const txResult = await cdp.evm.sendTransaction({
          address: senderWallet.address as Hex, 
          network: 'base-sepolia', 
          transaction: serializedTx as Hex,
        });
        console.log(`Transaction #${index} to ${recipientAddress} submitted. Hash: ${txResult.transactionHash}`);
        return { recipient: recipientAddress, txHash: txResult.transactionHash, index };
      } catch (error: any) {
        // Basic rate limit check
        const isRateLimitError = error.message?.toLowerCase().includes('rate limit') || 
                                 error.message?.toLowerCase().includes('too many requests') || 
                                 (error.details?.type === 'rate_limit_exceeded');
        
        if (isRateLimitError && retryCount < MAX_RETRIES) {
          retryCount++;
          const delay = BASE_DELAY_MS * Math.pow(2, retryCount -1) + (Math.random() * (BASE_DELAY_MS / 2));
          console.warn(
            `Rate limit encountered for transaction #${index} to ${recipientAddress}. Retrying in ${Math.round(delay)}ms (attempt ${retryCount}/${MAX_RETRIES}). Error: ${error.message}`
          );
          await sleep(delay);
        } else {
          console.error(`Failed to send transaction #${index} to ${recipientAddress} after ${retryCount} retries. Error: ${error.message}`);
          throw { recipient: recipientAddress, error, index }; // Rethrow to be caught by Promise.allSettled
        }
      }
    }
  });

  // 6. Use Promise.allSettled for submissions
  const submissionResults = await Promise.allSettled(submissionPromises);

  const receiptPromises: Promise<BatchTransactionResult & { receiptData?: TransactionReceipt | null }>[] = [];

  submissionResults.forEach((result, i) => {
    const recipient = (result.status === 'fulfilled' ? result.value.recipient : result.reason.recipient) || recipients[i];
    if (result.status === 'fulfilled') {
      const { txHash } = result.value;
      results.push({
        recipient,
        submissionStatus: 'fulfilled',
        txHash,
        confirmationStatus: 'pending',
      });
      // Create a promise to wait for the receipt
      receiptPromises.push(
        (async () => {
          console.log(`Waiting for receipt of transaction to ${recipient} (Hash: ${txHash})...`);
          try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash, timeout: 120_000 }); // 2 min timeout
            console.log(`Transaction to ${recipient} confirmed. Block: ${receipt.blockNumber}`);
            return { recipient, txHash, submissionStatus: 'fulfilled', confirmationStatus: 'confirmed', receiptData: receipt };
          } catch (receiptError: any) {
            console.warn(`Timeout or error waiting for receipt for ${recipient} (Hash: ${txHash}): ${receiptError.message}`);
            return { recipient, txHash, submissionStatus: 'fulfilled', confirmationStatus: 'timeout_or_failed', receiptData: null, confirmationError: receiptError.message };
          }
        })()
      );
    } else {
      // Submission failed
      console.error(`Submission failed for recipient ${recipient}: ${result.reason.error?.message || result.reason}`);
      results.push({
        recipient,
        submissionStatus: 'rejected',
        submissionError: result.reason.error?.message || String(result.reason),
        confirmationStatus: 'not_attempted',
      });
    }
  });

  // 7. Await all receipt promises
  if (receiptPromises.length > 0) {
    console.log(`Waiting for ${receiptPromises.length} transaction receipts...`);
    const receiptWaitResults = await Promise.allSettled(receiptPromises);

    receiptWaitResults.forEach(receiptResult => {
      if (receiptResult.status === 'fulfilled') {
        const { recipient, txHash, confirmationStatus, receiptData, confirmationError } = receiptResult.value;
        const existingResult = results.find(r => r.txHash === txHash && r.recipient === recipient);
        if (existingResult) {
          existingResult.confirmationStatus = confirmationStatus;
          existingResult.receipt = receiptData;
          if (confirmationError) existingResult.confirmationError = confirmationError;
        }
      } else {
        // This case should ideally not happen if the inner async func in receiptPromises handles its errors
        // But if it does, we need to find the original promise by some other means or log generally
        console.error(`An unexpected error occurred while processing a receipt promise: ${receiptResult.reason}`);
      }
    });
  }

  // 8. Log summary and return JSON response
  const successfulSubmissions = results.filter(r => r.submissionStatus === 'fulfilled').length;
  const confirmedTransactions = results.filter(r => r.confirmationStatus === 'confirmed').length;
  
  console.log("\n--- Batch Send Summary ---");
  console.log(`Total recipients: ${recipients.length}`);
  console.log(`Successfully submitted: ${successfulSubmissions}`);
  console.log(`Confirmed on-chain: ${confirmedTransactions}`);
  console.log(`Failed/Timed out: ${results.length - confirmedTransactions}`);
  console.log("------------------------\n");

  // Sanitize results to convert BigInts to strings before sending response
  const sanitizedDetails = stringifyBigInts(results);

  res.status(200).json({
    message: 'Batch transaction processing initiated.',
    summary: {
      totalRecipients: recipients.length,
      submittedSuccessfully: successfulSubmissions,
      confirmedOnChain: confirmedTransactions,
    },
    details: sanitizedDetails, // Use sanitized details
  });
});

// Start the Express server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
