import { ensureBaseProviderConnected, getBaseAccountProvider } from '@/lib/base-account-sdk'
import { toHex } from 'viem'

/**
 * Gas Sponsorship (Paymaster) functionality for Base Account
 * Complete implementation of sponsored transactions
 */

export interface PaymasterConfig {
  url: string
  type: 'eth'
  sponsorshipRules?: {
    maxGasLimit?: number
    allowedMethods?: string[]
    dailyLimit?: number
  }
}

// In production, use your own paymaster proxy endpoints for security and control
export const PAYMASTER_CONFIGS = {
  default: {
    // Proxy or CDP Paymaster URL: set via env for security
    url:
      process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL ||
      'https://api.developer.coinbase.com/rpc/v1/base-sepolia/REPLACE_ME',
    type: 'eth' as const,
    sponsorshipRules: {
      maxGasLimit: 1000000,
      dailyLimit: 10
    }
  }
}

/**
 * Send sponsored transaction
 * In production: implement your own paymaster proxy for security and control
 */

/**
 * Send sponsored calls with custom configuration
 */
// Send a transaction sponsored by a Paymaster using wallet_sendCalls.
// - userAddress: user's smart account address
// - calls: array of low-level calls to execute
// - chainId: Base Sepolia (84532) in this tutorial
export async function sendSponsoredCalls(
  userAddress: `0x${string}`,
  chainId: number,
  calls: Array<{ 
    to: `0x${string}`
    value?: string
    data?: `0x${string}` 
  }>,
  config: PaymasterConfig = PAYMASTER_CONFIGS.default
): Promise<string | null> {
  const provider = getBaseAccountProvider()
  await ensureBaseProviderConnected()

  try {
    const normalizedCalls = calls.map((c) => ({
      to: c.to,
      data: (c.data || '0x') as `0x${string}`,
      value: toHex(c.value ? BigInt(c.value) : 0n),
    }))

    const txHash = await provider.request({
      method: 'wallet_sendCalls',
      params: [{
        from: userAddress,
        chainId: toHex(84532),
        version: '1',
        calls: normalizedCalls,
        capabilities: { 
          paymasterService: { 
            url: process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL || 'https://api.developer.coinbase.com/rpc/v1/base-sepolia/REPLACE_ME',
            ...(config.sponsorshipRules && { data: config.sponsorshipRules })
          } 
        },
      }],
    }) as string

    console.log('Sponsored calls sent:', txHash)
    return txHash
  } catch (error) {
    console.error('Sponsored calls failed:', error)
    return null
  }
}
