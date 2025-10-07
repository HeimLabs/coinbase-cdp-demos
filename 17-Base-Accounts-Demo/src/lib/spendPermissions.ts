import { getBaseAccountProvider } from '@/lib/base-account-sdk'
import {
  requestSpendPermission as sdkRequestSpendPermission,
  prepareSpendCallData,
} from '@base-org/account/spend-permission'

// Simplified type alias for the permission object returned by the SDK
export type Permission = any

// Request a Spend Permission using the SDK helper
// - account: user's Base Account (smart account) the permission applies to
// - spender: your app's spender address that will execute future transfers
// - token: ERC-20 token address (USDC on Base Mainnet in our UI)
// - allowance: spend limit in token base units for each period
// - periodInDays: recurring period window (e.g., 30 days)
// - chainId: chain on which the permission is valid (8453 = Base Mainnet)
export async function requestSpendPermission(
  account: `0x${string}`,
  spender: `0x${string}`,
  token: `0x${string}`,
  allowance: bigint,
  periodInDays: number,
  chainId: number = 8453,
) {
  const provider = getBaseAccountProvider()
  const permission = await sdkRequestSpendPermission({
    provider,
    account,
    spender,
    token,
    chainId,
    allowance,
    periodInDays,
  })
  return permission as Permission
}

// Prepare and execute spend calls using wallet_sendCalls v2
// - On first use, returned array typically includes approveWithSignature then spend
// - On subsequent uses, only the spend call is included
export async function executeSpendCalls(
  permission: Permission,
  amount: bigint | undefined,
  spender: `0x${string}`,
  chainId: number = 8453,
) {
  const provider = getBaseAccountProvider()
  const calls = await prepareSpendCallData(permission as any, amount ?? 'max-remaining-allowance')
  const txHash = (await provider.request({
    method: 'wallet_sendCalls',
    params: [
      {
        version: '2.0',
        atomicRequired: true,
        from: spender,
        calls: calls as any,
      },
    ],
  })) as string
  return txHash
}

// Optional storage helper (demo): persist the permission in a backend store
// In production, replace with your database and proper authentication
export async function storeSpendPermission(
  permission: Permission,
  metadata?: { description?: string; category?: string; frequency?: 'monthly' | 'weekly' | 'daily' },
): Promise<boolean> {
  try {
    const response = await fetch('/api/subscriptions/save', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        signature: permission?.signature || '0x',
        spendPermissionData: permission,
        metadata: { createdAt: new Date().toISOString(), ...metadata },
      }),
    })
    return response.ok
  } catch (e) {
    return false
  }
}
