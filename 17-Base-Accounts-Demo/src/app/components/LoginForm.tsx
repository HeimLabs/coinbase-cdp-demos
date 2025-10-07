import React from 'react'
import { createBaseAccountSDK } from '@base-org/account'

type LoginFormProps = {
  onSignIn?: (address: string) => void;
  isSigningIn?: boolean;
};

export function LoginForm({ onSignIn, isSigningIn }: LoginFormProps) {
  const handleSignIn = async () => {
    try {
      const provider = createBaseAccountSDK({ appName: 'Base Accounts Demo' }).getProvider()
      const nonce = window.crypto.randomUUID().replace(/-/g, '')
      const response = await provider.request({
        method: 'wallet_connect',
        params: [
          {
            version: '1',
            capabilities: {
              signInWithEthereum: {
                // chainid must be a hex string
                chainId: "0x" + (8453).toString(16),
                nonce,
              },
            },
          },
        ],
      }) as { accounts: { address: string; capabilities?: { signInWithEthereum?: { message: string; signature: `0x${string}` } } }[] }

      // Extract SIWE message & signature and verify on server
      const account = response.accounts[0]
      const { address } = account
      const siwe = account.capabilities?.signInWithEthereum as { message: string; signature: `0x${string}` }
      const message = siwe?.message
      const signature = siwe?.signature

      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ address, message, signature }),
      })
      if (!verifyRes.ok) {
        const err = await verifyRes.json().catch(() => ({}))
        throw new Error(err?.error || 'Verification failed')
      }

      onSignIn?.(address)
    } catch (err) {
      console.error('Sign in failed:', err)
    }
  }

  return (
    <button type="button" onClick={handleSignIn} disabled={!!isSigningIn} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px',
      backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, cursor: isSigningIn ? 'not-allowed' : 'pointer',
      minWidth: 180, height: 44
    }}>
      <div style={{ width: 16, height: 16, backgroundColor: '#0052FF', borderRadius: 2 }} />
      <span>{isSigningIn ? 'Signing in...' : 'Sign in with Base'}</span>
    </button>
  )
}