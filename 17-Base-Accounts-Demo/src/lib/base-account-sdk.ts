import { createBaseAccountSDK, type ProviderInterface } from '@base-org/account'

type WalletConnectResponse = {
  accounts: Array<{
    address: `0x${string}`
    capabilities?: {
      signInWithEthereum?: { message: string; signature: `0x${string}` } | { code: number; message: string }
    }
  }>
}

let cachedProvider: ProviderInterface | null = null

// Lazily create and cache a single Base Account provider for the app.
// The provider implements the EIP-1193 interface and supports new
// Base Account RPC methods (wallet_connect, wallet_sendCalls, etc.).
export function getBaseAccountProvider(): ProviderInterface {
  if (cachedProvider) return cachedProvider
  const sdk = createBaseAccountSDK({
    appName: 'Base Accounts Demo',
    appLogoUrl: 'https://base.org/logo.png',
  })
  cachedProvider = sdk.getProvider()
  return cachedProvider
}

// Ensure the provider is connected in a wallet-agnostic way.
// Prefer wallet_connect; fall back to eth_requestAccounts when needed.
export async function ensureBaseProviderConnected(): Promise<void> {
  const provider = getBaseAccountProvider()
  
  try {
    // Use wallet_connect method for Base Account authentication
    await provider.request({ 
      method: 'wallet_connect',
      params: [{
        version: '1',
        capabilities: {}
      }]
    })
  } catch (error) {
    console.warn('wallet_connect not supported, falling back to eth_requestAccounts')
    // Fallback for wallets that don't support wallet_connect yet
    await provider.request({ method: 'eth_requestAccounts' })
  }
}

// Base Account authentication helper
export async function authenticateWithBase(nonceIn?: string): Promise<{
  address: string;
  message: string;
  signature: `0x${string}`;
}> {
  const provider = getBaseAccountProvider()
  // 1 — get a fresh nonce (prefer provided, else generate locally)
  const nonce = nonceIn || window.crypto.randomUUID().replace(/-/g, '')
  
  // 2 — connect and authenticate using wallet_connect with signInWithEthereum capability
  try {
    const response = (await provider.request({
      method: 'wallet_connect',
      params: [{
        version: '1',
        capabilities: {
          signInWithEthereum: { 
            nonce, 
            chainId: 8453,
          }
        }
      }]
    })) as WalletConnectResponse

    const account = response.accounts[0]
    const { address } = account
    const siwe = account.capabilities?.signInWithEthereum as { message: string; signature: `0x${string}` }
    const message = siwe?.message ?? ''
    const signature = siwe?.signature ?? ('0x' as `0x${string}`)
    return { address, message, signature }
  } catch (err) {
    console.error(`err ${err}`)
    throw err
  }
}


