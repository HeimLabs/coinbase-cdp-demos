/**
 * CDP Client Manager
 * Handles initialization and access to the Coinbase Developer Platform (CDP) SDK client
 * Implements a singleton pattern to ensure only one client instance exists
 */

import { CdpClient } from '@coinbase/cdp-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Singleton instance of the CDP client
let cdpClientInstance: CdpClient | null = null;

/**
 * Initializes the CDP client with credentials from environment variables
 * Required environment variables:
 * - CDP_API_KEY_ID: API key identifier
 * - CDP_API_KEY_SECRET: API key secret
 * - CDP_WALLET_SECRET: Wallet encryption secret
 * 
 * @throws Will exit process if required environment variables are missing
 */
export function initializeCdpClient(): void {
  const apiKeyId = process.env.CDP_API_KEY_ID;
  const apiKeySecret = process.env.CDP_API_KEY_SECRET;
  const walletSecret = process.env.CDP_WALLET_SECRET;

  if (!apiKeyId || !apiKeySecret || !walletSecret) {
    console.error('Missing CDP environment variables. Please check your .env file.');
    process.exit(1);
  }

  if (!cdpClientInstance) {
    cdpClientInstance = new CdpClient({
      apiKeyId,
      apiKeySecret,
      walletSecret,
    });
    console.log('CDP Client Initialized');
  } else {
    console.warn('CDP Client already initialized.');
  }
}

/**
 * Retrieves the initialized CDP client instance
 * @returns The singleton CDP client instance
 * @throws Error if client has not been initialized
 */
export function getCdpClient(): CdpClient {
  if (!cdpClientInstance) {
    throw new Error('CDP Client has not been initialized. Call initializeCdpClient() first.');
  }
  return cdpClientInstance;
}
