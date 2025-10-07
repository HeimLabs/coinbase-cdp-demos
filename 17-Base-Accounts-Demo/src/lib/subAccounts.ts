import { ensureBaseProviderConnected, getBaseAccountProvider } from '@/lib/base-account-sdk'
import { toHex } from 'viem'

// Minimal interface for sub-account info as returned by wallet_getSubAccounts
type SubAccountInfo = {
  address: `0x${string}`
  factory?: `0x${string}`
  factoryData?: `0x${string}`
}

type GetSubAccountsResponse = {
  subAccounts?: SubAccountInfo[]
}

type AddSubAccountResponse = SubAccountInfo

/**
 * Comprehensive Sub-Account management for Base Account
 * Implements all sub-account capabilities from Base Account documentation
 */

/**
 * Get existing sub-accounts for the user
 */
export async function getSubAccounts(
  universalAddress: `0x${string}`,
  chainId: number,
  domain?: string
): Promise<SubAccountInfo[]> {
  const provider = getBaseAccountProvider()
  await ensureBaseProviderConnected()

  try {
    const { subAccounts } = (await provider.request({
      method: 'wallet_getSubAccounts',
      params: [{ 
        version: '1', 
        account: universalAddress, 
        domain: domain || window.location.origin, 
        chainId: toHex(84532) 
      }],
    })) as GetSubAccountsResponse

    return subAccounts || []
  } catch (error) {
    console.error('Failed to get sub-accounts:', error)
    return []
  }
}

/**
 * Create a new sub-account
 */
export async function createSubAccount(
  accountType: 'create' | 'import' = 'create',
  factory?: `0x${string}`,
  factoryData?: `0x${string}`
): Promise<`0x${string}` | null> {
  const provider = getBaseAccountProvider()
  await ensureBaseProviderConnected()

  try {
    const newSubAccount = (await provider.request({
      method: 'wallet_addSubAccount',
      params: [{ 
        version: '1', 
        account: { 
          type: accountType,
          factory,
          factoryData
        } 
      }],
    })) as AddSubAccountResponse

    console.log('Created new sub-account:', newSubAccount.address)
    return newSubAccount.address
  } catch (error) {
    console.error('Failed to create sub-account:', error)
    return null
  }
}

/**
 * Get or create a sub-account
 */
export async function getOrCreateSubAccount(
  universalAddress: `0x${string}`,
  chainId: number,
  domain?: string
): Promise<`0x${string}`> {
  const provider = getBaseAccountProvider()
  await ensureBaseProviderConnected()

  // 1. Check if a sub-account already exists for the domain
  const existingSubAccounts = await getSubAccounts(universalAddress, chainId, domain)

  if (existingSubAccounts.length > 0) {
    console.log('Found existing sub-account:', existingSubAccounts[0].address)
    return existingSubAccounts[0].address
  }

  // 2. If not, create a new one
  const newSubAccountAddress = await createSubAccount()
  if (!newSubAccountAddress) {
    throw new Error('Failed to create sub-account')
  }

  return newSubAccountAddress
}

/**
 * Remove a sub-account
 */
export async function removeSubAccount(
  subAccountAddress: `0x${string}`
): Promise<boolean> {
  const provider = getBaseAccountProvider()
  await ensureBaseProviderConnected()

  try {
    await provider.request({
      method: 'wallet_removeSubAccount',
      params: [{ 
        version: '1', 
        account: subAccountAddress 
      }],
    })

    console.log('Removed sub-account:', subAccountAddress)
    return true
  } catch (error) {
    console.error('Failed to remove sub-account:', error)
    return false
  }
}

/**
 * Transfer funds between main account and sub-account
 */
export async function transferToSubAccount(
  fromAddress: `0x${string}`,
  toSubAccount: `0x${string}`,
  amount: string,
  chainId: number
): Promise<string | null> {
  const provider = getBaseAccountProvider()
  await ensureBaseProviderConnected()

  try {
    const txHash = await provider.request({
      method: 'wallet_sendCalls',
      params: [{
        from: fromAddress,
        chainId: toHex(chainId),
        version: '1',
        calls: [{
          to: toSubAccount,
          value: amount,
          data: '0x'
        }]
      }]
    }) as string

    console.log('Transfer to sub-account sent:', txHash)
    return txHash
  } catch (error) {
    console.error('Transfer to sub-account failed:', error)
    return null
  }
}

/**
 * Execute transaction from sub-account
 */
export async function executeFromSubAccount(
  subAccountAddress: `0x${string}`,
  calls: Array<{
    to: `0x${string}`
    value?: string
    data?: `0x${string}`
  }>,
  chainId: number
): Promise<string | null> {
  const provider = getBaseAccountProvider()
  await ensureBaseProviderConnected()

  try {
    const txHash = await provider.request({
      method: 'wallet_sendCalls',
      params: [{
        from: subAccountAddress,
        chainId: toHex(chainId),
        version: '1',
        calls
      }]
    }) as string

    console.log('Sub-account transaction sent:', txHash)
    return txHash
  } catch (error) {
    console.error('Sub-account transaction failed:', error)
    return null
  }
}

/**
 * Get sub-account balance
 */
export async function getSubAccountBalance(
  subAccountAddress: `0x${string}`,
  tokenAddress?: `0x${string}`
): Promise<string | null> {
  const provider = getBaseAccountProvider()

  try {
    if (tokenAddress) {
      // Get ERC20 token balance using balanceOf(address)
      // 0x70a08231 is the function selector for balanceOf
      const balance = await provider.request({
        method: 'eth_call',
        params: [{
          to: tokenAddress,
          data: `0x70a08231000000000000000000000000${subAccountAddress.slice(2)}`
        }, 'latest']
      }) as string
      return balance
    } else {
      // Get native ETH balance of the sub-account
      const balance = await provider.request({
        method: 'eth_getBalance',
        params: [subAccountAddress, 'latest']
      }) as string
      return balance
    }
  } catch (error) {
    console.error('Failed to get sub-account balance:', error)
    return null
  }
}
