// Demo scaffolding:
// - This helper provides a SIWE-like flow: generate a one-time nonce and verify a signed message.
// - It is NOT wired up by default in this demo to keep the authentication minimal (connect → address → session),
//   mirroring the agent project. In production, you should:
//   1) Persist nonces in a shared store (e.g. Redis/DB) and enforce single-use.
//   2) Verify { address, message, signature } server-side using viem before issuing a session.
//   3) Consider binding the session to the address and rotating tokens appropriately.

import { createPublicClient, http } from 'viem'
import { base } from 'viem/chains'

const client = createPublicClient({ 
  chain: base, 
  transport: http() 
})

const nonces = new Set<string>()

export function generateNonce(): string {
  const nonce = window.crypto.randomUUID().replace(/-/g, '')
  nonces.add(nonce)
  return nonce
}

export async function verifySignature(
  address: string, 
  message: string, 
  signature: string
): Promise<boolean> {
  try {
    // Extract nonce from message
    const nonce = message.match(/at (\w{32})$/)?.[1]
    if (!nonce || !nonces.delete(nonce)) {
      console.error('Invalid or reused nonce')
      return false
    }

    // Verify signature
    const valid = await client.verifyMessage({ 
      address: address as `0x${string}`, 
      message, 
      signature: signature as `0x${string}` 
    })
    
    return valid
  } catch (error) {
    console.error('Signature verification failed:', error)
    return false
  }
}


