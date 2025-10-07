import { getBaseAccountProvider, ensureBaseProviderConnected } from '@/lib/base-account-sdk'

// Sign EIP-712 typed data with the user's Base Account.
// Returns the signature hex string or null if the user rejects.
export async function signTypedData(
  userAddress: `0x${string}`,
  domain: any,
  types: any,
  message: any
): Promise<string | null> {
  const provider = getBaseAccountProvider()
  await ensureBaseProviderConnected()

  try {
    const signature = await provider.request({
      method: 'eth_signTypedData_v4',
      params: [userAddress, {
        domain,
        types,
        primaryType: Object.keys(types).find((key) => key !== 'EIP712Domain') || '',
        message,
      }],
    }) as string

    return signature
  } catch (error) {
    return null
  }
}


