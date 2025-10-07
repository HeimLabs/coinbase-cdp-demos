// src/app/page.tsx - Step 6: Complete Tutorial with Base Pay
'use client'

import { useState } from 'react'
import { encodeFunctionData, numberToHex } from 'viem'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { LoginForm } from '@/app/components/LoginForm'
import { pay, getPaymentStatus } from '@base-org/account'
import { sendSponsoredCalls } from '@/lib/gasSponsorship'
import { getBaseAccountProvider } from '@/lib/base-account-sdk'
import { getOrCreateSubAccount, getSubAccounts } from '@/lib/subAccounts'
import { requestSpendPermission, storeSpendPermission } from '@/lib/spendPermissions'
import { signTypedData } from '@/lib/advancedCapabilities'

export default function BaseAccountTutorial() {
  const account = useAccount()
  const { connectors, connectAsync } = useConnect()
  const { disconnect } = useDisconnect()

  // Core state
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [busy, setBusy] = useState(false)

  // Gas sponsorship and batch transactions state
  const [sponsoredTxHash, setSponsoredTxHash] = useState<string | null>(null)
  const [batchTxHash, setBatchTxHash] = useState<string | null>(null)

  // Sub-accounts state
  const [subAccount, setSubAccount] = useState<string | null>(null)
  const [subAccounts, setSubAccounts] = useState<string[]>([])

  // Spend permissions state
  const [spendPermissionCreated, setSpendPermissionCreated] = useState(false)

  // Typed data signing state
  const [typedDataSignature, setTypedDataSignature] = useState<string | null>(null)

  // New state for Base Pay
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'completed' | 'failed'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)

  const universalAddress = account.addresses?.[0]
  const chainId = 84532 // Base Sepolia (testnet)

  async function ensureConnected() {
    if (account.status !== 'connected') {
      const connector = connectors[0]
      await connectAsync({ connector })
    }
  }

  // Simple sign-in handler
  const handleSignIn = async (_address?: string) => {
    try {
      setIsSigningIn(true)
      setIsSignedIn(true)
    } catch (error) {
      console.error('Sign-in failed:', error)
      setIsSignedIn(false)
    } finally {
      setIsSigningIn(false)
    }
  }

  // Gas sponsorship handler
  const handleSponsoredTransaction = async () => {
    if (!universalAddress) return
    setBusy(true)
    try {
      const nftAddress = '0x119Ea671030FBf79AB93b436D2E20af6ea469a19' as `0x${string}`
      const nftAbi = [
        {
          name: 'safeMint',
          type: 'function',
          stateMutability: 'nonpayable',
          inputs: [{ name: 'to', type: 'address' }],
          outputs: [],
        },
      ] as const
      const calls = [
        {
          to: nftAddress,
          value: '0x0',
          data: encodeFunctionData({ abi: nftAbi, functionName: 'safeMint', args: [universalAddress] }),
        },
      ]

      const hash = await sendSponsoredCalls(universalAddress as `0x${string}`, chainId, calls, {
        url:
          process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL ||
          'https://api.developer.coinbase.com/rpc/v1/base-sepolia/REPLACE_ME',
        type: 'eth',
      })
      setSponsoredTxHash(hash)
    } finally {
      setBusy(false)
    }
  }

  // Batch transaction handler
  const handleBatchMint = async () => {
    if (!universalAddress) return
    setBusy(true)
    try {
      const provider = getBaseAccountProvider()
      const nftAddress = '0x119Ea671030FBf79AB93b436D2E20af6ea469a19' as `0x${string}`
      const nftAbi = [ { name: 'safeMint', type: 'function', stateMutability: 'nonpayable', inputs: [ { name: 'to', type: 'address' } ], outputs: [] } ] as const
      const calls = Array.from({ length: 5 }).map(() => ({
        to: nftAddress,
        value: '0x0' as `0x${string}`,
        data: encodeFunctionData({ abi: nftAbi, functionName: 'safeMint', args: [universalAddress] }),
      }))

      const txHashes = await provider.request({
        method: 'wallet_sendCalls',
        params: [ {
          version: '2.0.0',
          from: universalAddress,
          chainId: numberToHex(84532),
          atomicRequired: true,
          calls,
          capabilities: {
            paymasterService: {
              url: process.env.NEXT_PUBLIC_PAYMASTER_PROXY_SERVER_URL || 'https://api.developer.coinbase.com/rpc/v1/base-sepolia/REPLACE_ME',
            }
          }
        } ]
      }) as string
      const txHash = txHashes[0];
      setBatchTxHash(txHash)
    } finally {
      setBusy(false)
    }
  }

  // Sub-accounts handler
  const handleCreateSubAccount = async () => {
    if (!universalAddress) return
    setBusy(true)
    try {
      const addr = await getOrCreateSubAccount(universalAddress as `0x${string}`, chainId)
      setSubAccount(addr)
      // Refresh sub-accounts list
      const accounts = await getSubAccounts(universalAddress as `0x${string}`, chainId)
      setSubAccounts(accounts.map(acc => acc.address))
    } finally {
      setBusy(false)
    }
  }

  // Spend permissions handler
  const handleSpendPermissions = async () => {
    if (!universalAddress || !subAccount) return
    setBusy(true)
    try {
      const allowance = 1_000_000n // allowance (token base units)
      const permission = await requestSpendPermission(
        universalAddress as `0x${string}`,
        subAccount as `0x${string}`,
        // USDC on Base mainnet
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
        allowance,
        30,
        8453, // Base Mainnet for USDC
      )

      await storeSpendPermission(permission, {
        description: 'Monthly subscription',
        frequency: 'monthly',
      })
      setSpendPermissionCreated(true)
      alert('Spend permission created and stored!')
    } catch (error) {
      console.error('Spend permission creation failed:', error)
      alert('Failed to create spend permission. This demo requires Base Mainnet.')
    } finally {
      setBusy(false)
    }
  }

  // Typed data signing handler
  const handleSignTypedData = async () => {
    if (!universalAddress) return
    setBusy(true)
    try {
      const domain = {
        name: 'Base Account Demo',
        version: '1',
        chainId,
        verifyingContract: '0x0000000000000000000000000000000000000001'
      }
      
      const types = {
        Message: [
          { name: 'content', type: 'string' },
          { name: 'timestamp', type: 'uint256' }
        ]
      }
      
      const message = {
        content: 'Hello Base Account!',
        timestamp: Math.floor(Date.now() / 1000)
      }
      
      const signature = await signTypedData(universalAddress as `0x${string}`, domain, types, message)
      if (signature) {
        setTypedDataSignature(signature)
      }
    } finally {
      setBusy(false)
    }
  }

  // Base Pay handler
  const handlePayment = async () => {
    setPaymentStatus('pending')
    setTxHash(null)
    
    try {
      const payment = await pay({
        amount: '1.00',
        to: '0x64839d6BE0552d92AA8bD18Cbc16C4987bC07c6f',
        testnet: true
      })

      const checkStatus = async () => {
        try {
          const { status, id: transactionId } = await getPaymentStatus({ 
            id: payment.id,
            testnet: true
          })
          
          if (status === 'completed') {
            setPaymentStatus('completed')
            setTxHash(transactionId || payment.id)
          } else if (status === 'failed') {
            setPaymentStatus('failed')
          } else {
            setTimeout(checkStatus, 2000)
          }
        } catch (error) {
          setPaymentStatus('failed')
        }
      }
      
      checkStatus()
    } catch (error) {
      setPaymentStatus('failed')
      console.error('Payment failed:', error)
    }
  }

  const cardStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 24,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    marginBottom: 24,
  }

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0052FF 0%, #1E3A8A 100%)',
    color: 'white',
    padding: 32,
    borderRadius: 12,
    marginBottom: 32,
    textAlign: 'center',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '12px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: busy || paymentStatus === 'pending' ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    fontSize: 14,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#0052FF',
    color: 'white',
    opacity: busy || paymentStatus === 'pending' ? 0.6 : 1
  }

  const successStyle: React.CSSProperties = {
    marginTop: 12,
    padding: 12,
    background: '#d1fae5',
    borderRadius: 8,
    fontSize: 14,
    color: '#065f46'
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700 }}>🚀 Base Account Tutorial</h1>
        <p style={{ margin: '16px 0 0 0', fontSize: 18, opacity: 0.9 }}>
          Complete Tutorial: All Base Account Features
        </p>
      </div>

      {/* Authentication */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 20 }}>Sign in with Base (SIWE)</h3>
        {!isSignedIn ? (
          <>
            <p style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
              Secure authentication using EIP-4361 with ERC-6492 support for undeployed smart wallets.
            </p>
            {account.status !== 'connected' ? (
              <button 
                onClick={() => ensureConnected()} 
                style={buttonStyle}
              >
                Connect Wallet
              </button>
            ) : (
              <>
                <LoginForm onSignIn={() => handleSignIn()} isSigningIn={isSigningIn} />
                <div style={{ marginTop: 12, padding: 8, background: '#f3f4f6', borderRadius: 6, fontSize: 12 }}>
                  Connected: {universalAddress?.slice(0, 8)}...{universalAddress?.slice(-6)}
                </div>
              </>
            )}
          </>
        ) : (
          <div style={successStyle}>
            ✅ Authenticated: {universalAddress?.slice(0, 8)}...{universalAddress?.slice(-6)}
            <button 
              onClick={() => { setIsSignedIn(false); disconnect() }}
              style={{ marginLeft: 12, padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: 4, fontSize: 12 }}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Gas Sponsorship */}
      {isSignedIn && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 20 }}>Gas Sponsorship (Paymasters)</h3>
          <p style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
            App pays for user's transaction fees, improving onboarding experience.
          </p>
          <button style={buttonStyle} onClick={handleSponsoredTransaction} disabled={busy}>
            {busy ? 'Sending...' : 'Send Sponsored Transaction'}
          </button>
          
          {sponsoredTxHash && (
            <div style={successStyle}>
              ✅ Sponsored TX sent! Hash: {sponsoredTxHash.slice(0, 10)}...
            </div>
          )}
        </div>
      )}

      {/* Batch Transactions */}
      {isSignedIn && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 20 }}>Batch Transactions</h3>
          <p style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
            Execute multiple operations in a single atomic transaction with gas sponsorship.
          </p>
          <button style={buttonStyle} onClick={handleBatchMint} disabled={busy}>
            {busy ? 'Minting...' : 'Batch Mint (5x NFTs)'}
          </button>
          {batchTxHash && (
            <div style={successStyle}>
              ✅ Batch transaction sent! Hash: {batchTxHash}...
            </div>
          )}
        </div>
      )}

      {/* Sub-Accounts */}
      {isSignedIn && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 20 }}>Sub-Accounts</h3>
          <p style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
            Create isolated accounts for specific use cases, reducing signing prompts and improving UX.
          </p>
          <button style={buttonStyle} onClick={handleCreateSubAccount} disabled={busy}>
            {busy ? 'Creating...' : (subAccount ? 'Refresh Sub-Account' : 'Create Sub-Account')}
          </button>
          {subAccount && (
            <div style={successStyle}>
              ✅ Sub-Account: {subAccount.slice(0, 8)}...{subAccount.slice(-6)}
              {subAccounts.length > 0 && (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  Total sub-accounts: {subAccounts.length}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Spend Permissions */}
      {isSignedIn && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 20 }}>Spend Permissions</h3>
          <p style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
            Create recurring payment authorizations for subscriptions and allowances using USDC on Base Mainnet.
          </p>
          <button 
            style={{
              ...buttonStyle, 
              backgroundColor: subAccount ? '#0052FF' : '#9ca3af',
              cursor: (busy || !subAccount) ? 'not-allowed' : 'pointer'
            }} 
            onClick={handleSpendPermissions} 
            disabled={busy || !subAccount}
          >
            {busy ? 'Creating...' : 'Create Subscription ($10/month USDC)'}
          </button>
          {!subAccount && (
            <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8 }}>
              ⚠️ Create a sub-account first to use as the spender
            </div>
          )}
          {spendPermissionCreated && (
            <div style={successStyle}>
              ✅ Spend permission created! Monthly USDC subscription authorized.
            </div>
          )}
        </div>
      )}

      {/* Typed Data Signing */}
      {isSignedIn && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 20 }}>Typed Data Signing</h3>
          <p style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
            Sign structured data (EIP-712) for off-chain authentication, permits, and advanced interactions.
          </p>
          <button style={buttonStyle} onClick={handleSignTypedData} disabled={busy}>
            {busy ? 'Signing...' : 'Sign Demo Message'}
          </button>
          {typedDataSignature && (
            <div style={successStyle}>
              ✅ Typed data signed successfully!
              <div style={{ fontSize: 12, marginTop: 4, color: '#475569', wordBreak: 'break-all' }}>
                Signature: {typedDataSignature.slice(0, 20)}...{typedDataSignature.slice(-20)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Base Pay */}
      {isSignedIn && (
        <div style={cardStyle}>
          <h3 style={{ margin: '0 0 16px 0', color: '#374151', fontSize: 20 }}>Base Pay (One-Tap Payments)</h3>
          <p style={{ marginBottom: 16, color: '#6b7280', fontSize: 14 }}>
            Seamless USDC payments with built-in onramps like Apple Pay and debit cards.
          </p>
          <div>
            <h4 style={{ marginBottom: 12, color: '#374151' }}>Premium Tutorial Access - $1.00 USDC</h4>
            <div style={{ opacity: paymentStatus === 'pending' ? 0.6 : 1, pointerEvents: paymentStatus === 'pending' ? 'none' : 'auto' }}>
              <button onClick={handlePayment} style={buttonStyle} disabled={paymentStatus === 'pending'}>
                {paymentStatus === 'pending' ? 'Processing...' : 'Pay with Base Pay'}
              </button>
            </div>
          </div>
          
          {paymentStatus === 'pending' && (
            <div style={{ marginTop: 12, padding: 8, background: '#fef3c7', borderRadius: 6, fontSize: 12, color: '#92400e' }}>
              🔄 Processing payment with Base Pay...
            </div>
          )}
          {paymentStatus === 'completed' && txHash && (
            <div style={successStyle}>
              ✅ Payment completed successfully! TX: {txHash.slice(0, 10)}...
              <div style={{ fontSize: 12, marginTop: 4, color: '#475569' }}>
                Payment processed instantly with Base Pay's integrated onramps!
              </div>
            </div>
          )}
          {paymentStatus === 'failed' && (
            <div style={{ marginTop: 12, padding: 8, background: '#fee2e2', borderRadius: 6, fontSize: 12, color: '#dc2626' }}>
              ❌ Payment failed. Please try again.
            </div>
          )}
        </div>
      )}

      {/* Final Completion Message */}
      {isSignedIn && paymentStatus === 'completed' && (
        <div style={{ 
          ...cardStyle, 
          background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', 
          color: 'white',
          textAlign: 'center'
        }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: 24 }}>🎉 Tutorial Complete!</h2>
          <p style={{ margin: '0 0 16px 0', fontSize: 16 }}>
            You've successfully implemented all Base Account features:
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 12, 
            fontSize: 14, 
            textAlign: 'left' 
          }}>
            <div>✅ Sign in with Base (SIWE)</div>
            <div>✅ Gas Sponsorship</div>
            <div>✅ Batch Transactions</div>
            <div>✅ Sub-Accounts</div>
            <div>✅ Spend Permissions</div>
            <div>✅ Typed Data Signing</div>
            <div>✅ Base Pay Integration</div>
          </div>
          <p style={{ margin: '16px 0 0 0', fontSize: 14, opacity: 0.9 }}>
            Your app now has the most advanced web3 UX features available!
          </p>
        </div>
      )}
    </div>
  )
}