/**
 * Viem Client Configuration
 * Sets up a public client for interacting with the Base Sepolia testnet
 * Used for reading blockchain state and sending transactions
 */

import { createPublicClient, http, PublicClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configure for Base Sepolia testnet
const selectedChain = baseSepolia;

console.log(`[viemClient] Initializing for chain: ${selectedChain.name}`);

/**
 * Public client instance for Base Sepolia
 * Used for:
 * - Reading blockchain state
 * - Estimating gas
 * - Simulating transactions
 * - Broadcasting transactions
 */
export const viemPublicClient = createPublicClient({
  chain: selectedChain,
  transport: http(),
}) as unknown as PublicClient;

console.log(`[viemClient]: Viem Public Client initialized for chain: ${selectedChain.name}.`);
