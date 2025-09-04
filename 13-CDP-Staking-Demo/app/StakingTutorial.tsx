'use client';

import { useState } from 'react';
import { ConnectKitButton } from 'connectkit';
import { useAccount, useSendTransaction } from 'wagmi';
import { BaseError, parseTransaction } from 'viem';

// A helper type for our transaction object
type UnsignedTx = {
  to: `0x${string}`;
  from: `0x${string}`;
  value: string;
  data: `0x${string}`;
  nonce: number;
  gas: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  chainId: number;
};

export default function StakingTutorial() {
  const [amount, setAmount] = useState('0.005');
  const [status, setStatus] = useState('Ready to start');
  const [stakeableBalance, setStakeableBalance] = useState('');
  const [unsignedTx, setUnsignedTx] = useState<UnsignedTx | null>(null);
  const [operationId, setOperationId] = useState('');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();

  const checkBalance = async () => {
    if (!isConnected) {
      setStatus("Please connect wallet first.");
      return;
    }
    setStatus('Checking stakeable balance...');
    setError('');
    try {
      const response = await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setStakeableBalance(data.stakeableBalance);
      setStatus(`Stakeable balance: ${data.stakeableBalance} ETH`);
    } catch (e: any) {
      setError(e.message);
      setStatus('Failed to check balance');
    }
  };

  const buildStakeOperation = async () => {
    if(!isConnected) { 
      setStatus("Please connect wallet first."); 
      return; 
    }
    setStatus('Building stake operation...');
    setError('');
    setUnsignedTx(null);
    setOperationId('');
    setTxHash('');
    try {
      const response = await fetch('/api/stake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address, amount })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setOperationId(data.operationId);
      
      // The unsigned transaction is a hex-encoded JSON string
      let parsedTx;
      try {
        // First decode from hex to string
        const hexString = data.unsignedTransaction;
        const jsonString = Buffer.from(hexString, 'hex').toString('utf8');
        // Then parse the JSON
        parsedTx = JSON.parse(jsonString);
        console.log('Decoded transaction:', parsedTx);
      } catch (e) {
        console.error('Failed to decode/parse unsigned transaction:', e);
        throw new Error('Invalid transaction format');
      }
      
      setUnsignedTx(parsedTx);
      setStatus('Stake operation built successfully!');
      console.log('Full operation details:', data);
    } catch (e: any) {
      setError(e.message);
      setStatus('Failed to build stake operation');
    }
  };

    // Sign and broadcast the transaction
const signAndBroadcast = () => {
    if (!unsignedTx) { 
      setError('No unsigned transaction available to sign.'); 
      return; 
    }
    setStatus('Waiting for signature...');
    setError('');
    setTxHash('');
  
    try {
      // The transaction from Coinbase SDK
      const txRequest = {
        to: unsignedTx.to as `0x${string}`,
        data: unsignedTx.input as `0x${string}`,
        value: BigInt(unsignedTx.value),
        gas: BigInt(unsignedTx.gas),
        maxFeePerGas: BigInt(unsignedTx.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(unsignedTx.maxPriorityFeePerGas),
        chainId: parseInt(unsignedTx.chainId),
      };
  
      console.log('Sending transaction:', txRequest);
  
      sendTransaction(txRequest, {
        onSuccess: (hash) => {
          setTxHash(hash);
          setStatus('Transaction broadcasted successfully!');
        },
        onError: (err) => {
          console.error('Transaction error:', err);
          if (err instanceof BaseError) {
            setError(err.shortMessage || err.message);
          } else {
            setError(err.message);
          }
          setStatus('Transaction failed or was rejected.');
        }
      });
    } catch (err: any) {
      console.error('Error preparing transaction:', err);
      setError(`Error: ${err.message}`);
      setStatus('Failed to prepare transaction');
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">Coinbase Staking API Tutorial</h1>
          <ConnectKitButton />
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">1️⃣ Enter Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Connected Wallet</label>
                  <input type="text" value={isConnected ? address : 'Please connect wallet'} readOnly className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount to Stake (ETH)</label>
                  <input type="text" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-sm font-mono" />
                </div>
                <button onClick={checkBalance} disabled={!isConnected} className="w-full bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 disabled:text-gray-500 font-medium py-2 px-4 rounded transition-colors">Check Stakeable Balance</button>
                {stakeableBalance && <div className="bg-blue-900 bg-opacity-30 rounded p-3 text-sm"><p>💰 Stakeable Balance: <span className="font-mono">{stakeableBalance} ETH</span></p></div>}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">2️⃣ Build Stake Operation</h3>
              <button onClick={buildStakeOperation} disabled={!isConnected || !amount} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 font-bold py-3 px-4 rounded transition-all">Build Unsigned Transaction</button>
            </div>
            {unsignedTx && <div className="bg-gray-800 rounded-lg p-6"><h3 className="text-lg font-semibold mb-4">3️⃣ Sign & Broadcast</h3><p className="text-sm text-gray-400 mb-4">An unsigned transaction is ready. Send it with your wallet.</p><button onClick={signAndBroadcast} className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 font-bold py-3 px-4 rounded transition-all">Sign & Broadcast Transaction</button></div>}
          </div>
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📊 Status</h3>
              <div className="space-y-3">
                <div className="bg-gray-700 rounded p-3"><p className="text-sm text-gray-400">Current Status:</p><p className="font-mono text-yellow-300">{status}</p></div>
                {error && <div className="bg-red-900 bg-opacity-30 rounded p-3 border border-red-500"><p className="text-sm text-red-300">{error}</p></div>}
                {operationId && <div className="bg-green-900 bg-opacity-30 rounded p-3 border border-green-500"><p className="text-sm text-green-300">✅ Operation ID:</p><p className="font-mono text-xs break-all">{operationId}</p></div>}
                {txHash && <div className="bg-green-900 bg-opacity-30 rounded p-3 border border-green-500"><p className="text-sm text-green-300">✅ Transaction Sent:</p><a href={`https://hoodi.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono text-xs break-all text-blue-400 hover:underline">{txHash}</a></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}