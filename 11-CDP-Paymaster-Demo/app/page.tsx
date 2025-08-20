'use client';

import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import { useAccount } from 'wagmi';
import { encodeFunctionData, type Address as ViemAddress } from 'viem';
import { baseSepolia } from 'viem/chains';
import type { TransactionError } from '@coinbase/onchainkit/transaction';

// NFT Contract Details
const NFT_CONTRACT_ADDRESS = '0x66519FCAee1Ed65bc9e0aCc25cCD900668D3eD49';
const NFT_CONTRACT_ABI = [
  {
    inputs: [
      { internalType: "address", name: "recipient", type: "address" },
      { internalType: "uint16", name: "item", type: "uint16" },
    ],
    name: "mintTo",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },
] as const;

export default function App() {
  const { address, isConnected, connector } = useAccount();
  
  // Check if user is connected with a Smart Wallet
  const isSmartWallet = !!(isConnected && connector?.id === 'coinbaseWalletSDK');
  console.log(isSmartWallet, connector?.id);

  // Prepare the mint transaction
  const mintCall = address ? [{
    to: NFT_CONTRACT_ADDRESS as ViemAddress,
    data: encodeFunctionData({
      abi: NFT_CONTRACT_ABI,
      functionName: 'mintTo',
      args: [address as ViemAddress, 1], // Minting item ID 1
    }),
    value: BigInt(0), // Free mint
  }] : [];

  const handleError = (error: TransactionError) => {
    if (error.message.includes('per address transaction count')) {
      alert('You have already claimed your free NFT!');
    } else {
      alert(`Error: ${error.message}`);
      console.error('Transaction error:', error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSuccess = (response: any) => {
    console.log('Transaction successful!', response);
    alert('NFT minted successfully! 🎉');
  };

  return (
    <div className="flex flex-col min-h-screen font-sans dark:bg-background dark:text-white bg-white text-black">
      <header className="pt-4 pr-4">
        <div className="flex justify-end">
          <div className="wallet-container">
            <Wallet>
              <ConnectWallet>
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                  <EthBalance />
                </Identity>
                <WalletDropdownLink
                  icon="wallet"
                  href="https://keys.coinbase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wallet
                </WalletDropdownLink>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-4xl w-full p-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Gas-Sponsored NFT Minting
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Experience frictionless onboarding with Coinbase Paymaster
            </p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="border rounded-lg p-6 dark:border-gray-700">
              {!isConnected ? (
                <div className="text-center">
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    Please connect your wallet to mint
                  </p>
                  <p className="text-sm text-gray-500">
                    Use Coinbase Smart Wallet for gas-free minting!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Connected as:
                    </p>
                    <p className="font-mono text-sm break-all mb-4">
                      {address}
                    </p>
                    
                    {isSmartWallet ? (
                      <div className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-3 mb-4">
                        <p className="text-green-800 dark:text-green-200 font-semibold">
                          ✨ Smart Wallet connected
                        </p>
                        <p className="text-green-700 dark:text-green-300 text-sm">
                          Your mint will be gas-sponsored!
                        </p>
                      </div>
                    ) : (
                      <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-4">
                        <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                          ⚠️ EOA wallet connected
                        </p>
                        <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                          You will need ETH to pay for gas
                        </p>
                      </div>
                    )}
                  </div>

                  <Transaction
                    isSponsored={true}
                    chainId={baseSepolia.id}
                    calls={mintCall}
                    onError={handleError}
                    onSuccess={handleSuccess}
                  >
                    <TransactionButton className="w-full" />
                    <TransactionStatus>
                      <TransactionStatusLabel />
                      <TransactionStatusAction />
                    </TransactionStatus>
                  </Transaction>

                  <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-2">How it works:</h3>
                    <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                      <li>• Smart Wallet users: Free gas-sponsored mint</li>
                      <li>• EOA users: Standard gas fees apply</li>
                      <li>• Limited to 1 NFT per address</li>
                      <li>• Powered by Coinbase Paymaster</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}