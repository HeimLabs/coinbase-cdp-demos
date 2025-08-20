import { 
  Avatar, 
  Name, 
  Badge, 
  Address,
  Identity,
  EthBalance 
} from '@coinbase/onchainkit/identity';
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction
} from '@coinbase/onchainkit/transaction';
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction';
import { 
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect 
} from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';
import { POA_ABI } from '@/lib/abi';
import { baseSepolia } from 'wagmi/chains';
import { useMiniKit, useAddFrame } from '@coinbase/onchainkit/minikit';
import { useCallback, useState } from 'react';

// Feature card component
function FeatureCard({ 
  title, 
  description, 
  icon, 
  active, 
  coming 
}: { 
  title: string;
  description: string;
  icon: string;
  active?: boolean;
  coming?: boolean;
}) {
  return (
    <div className={`
      bg-gray-900/40 backdrop-blur-lg rounded-2xl p-4 border transition-all duration-200
      ${active ? 'border-green-500/30 hover:border-green-500/50' : 'border-gray-700/30 hover:border-gray-600/50'}
      ${coming ? 'opacity-60' : ''}
    `}>
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
      {coming && (
        <span className="inline-block mt-2 text-xs bg-gray-800 px-2 py-1 rounded-full text-gray-400">
          Coming Soon
        </span>
      )}
    </div>
  );
}

export function MiniAppDemo() {
  const { address, isConnected } = useAccount();
  const { context } = useMiniKit();
  const addFrame = useAddFrame();
  const [frameAdded, setFrameAdded] = useState(false);
  
  // Demo values for our tutorial
  const eventId = "0x0000000000000000000000000000000000000000000000000000000000000001";
  const signature = "0x00"; // Not used in our simple contract

  const handleOnStatus = useCallback((status: LifecycleStatus) => {
    console.log('Transaction status:', status.statusName, status.statusData);
  }, []);

  const handleAddFrame = useCallback(async () => {
    const result = await addFrame();
    if (result) {
      setFrameAdded(true);
    }
  }, [addFrame]);

  // Apply safe area insets
  const safeAreaStyle = {
    paddingTop: context?.client?.safeAreaInsets?.top || 0,
    paddingBottom: context?.client?.safeAreaInsets?.bottom || 0,
    paddingLeft: context?.client?.safeAreaInsets?.left || 0,
    paddingRight: context?.client?.safeAreaInsets?.right || 0,
  };

    return (
    <div 
      className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white"
      style={safeAreaStyle}
    >
      {/* Mobile-optimized container with max-width for desktop */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        
        {/* Header with glassmorphism effect */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30"></div>
          <div className="relative bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 border border-gray-700/50">
            <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CDP Mini App Showcase
            </h1>
            <p className="text-center text-gray-400 text-sm mt-2">
              Experience the power of Base & Farcaster
            </p>
          </div>
        </div>

        {/* Save Frame Button - Popular pattern in mini apps */}
        {context && !context.client.added && !frameAdded && (
          <button
            onClick={handleAddFrame}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Save to Farcaster
          </button>
        )}
        
        {/* Base Account (formerly Smart Wallet) Section */}
        <div className="bg-gray-900/40 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/30 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <span className="text-blue-400 text-lg">1</span>
            </div>
            <h2 className="text-lg font-semibold">Base Account</h2>
          </div>
          
          <Wallet>
            <ConnectWallet className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-2xl py-3 transition-all duration-200">
              <Avatar className="h-6 w-6" />
              <Name className="ml-2" />
            </ConnectWallet>
            <WalletDropdown className="rounded-2xl border border-gray-700 bg-gray-900">
              <Identity 
                className="px-4 pt-3 pb-2" 
                hasCopyAddressOnClick
              >
                <Avatar className="h-10 w-10" />
                <Name className="font-medium" />
                <Address />
                <EthBalance />
              </Identity>
              <WalletDropdownDisconnect className="hover:bg-gray-800" />
            </WalletDropdown>
          </Wallet>
        </div>

        {/* Onchain Identity - Only show when connected */}
        {isConnected && (
          <div className="bg-gray-900/40 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/30 shadow-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <span className="text-purple-400 text-lg">2</span>
              </div>
              <h2 className="text-lg font-semibold">Onchain Identity</h2>
            </div>
            
            <Identity 
              address={address} 
              className="flex items-center gap-3"
            >
              <Avatar className="h-12 w-12 ring-2 ring-purple-500/30" />
              <div className="flex-1">
                <Name className="text-lg font-medium" />
                <Badge className="mt-1" />
              </div>
            </Identity>
          </div>
        )}

        {/* Gasless Transaction */}
        {isConnected && (
          <div className="bg-gray-900/40 backdrop-blur-lg rounded-3xl p-6 border border-gray-700/30 shadow-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="text-green-400 text-lg">3</span>
              </div>
              <h2 className="text-lg font-semibold">Gasless Transaction</h2>
            </div>
            
            <p className="text-gray-400 text-sm mb-4">
              Claim your POA NFT with zero gas fees, powered by CDP Paymaster
            </p>
            
            <Transaction
              chainId={baseSepolia.id}
              contracts={[{
                address: "0x696a22e358e861253B7aB7CBa22c3e2667CF9b5B",
                abi: POA_ABI,
                functionName: 'mintAttendance',
                args: [eventId, signature],
              }]}
              onStatus={handleOnStatus}
              isSponsored={true}
            >
              <TransactionButton 
                text="Claim POA NFT 🎉" 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl py-3 font-medium transition-all duration-200"
              />
              <TransactionStatus className="mt-3">
                <TransactionStatusLabel className="text-sm text-gray-400" />
                <TransactionStatusAction className="text-sm" />
              </TransactionStatus>
            </Transaction>
          </div>
        )}

        {/* Context Info - Minimalist design */}
        {context && (
          <div className="bg-gray-900/40 backdrop-blur-lg rounded-3xl p-4 border border-gray-700/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Farcaster ID</span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <span className="font-mono text-gray-300">{(context.client as any)?.fid || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Explore CDP - Updated section name and content */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Explore CDP</h3>
          <div className="grid grid-cols-2 gap-3">
            <FeatureCard 
              title="MiniKit"
              description="Build mini apps with ease"
              icon="🚀"
              active
            />
            <FeatureCard 
              title="Base Accounts"
              description="Universal passkey accounts"
              icon="🔐"
              active
            />
            <FeatureCard 
              title="Paymaster"
              description="Gasless transactions"
              icon="⛽"
              active
            />
            <FeatureCard 
              title="OnchainKit"
              description="React components & utilities"
              icon="🎨"
              active
            />
            <FeatureCard 
              title="Checkout"
              description="USDC payment flows"
              icon="💳"
              active
            />
            <FeatureCard 
              title="Fund"
              description="Onramp integration"
              icon="💰"
              active
            />
          </div>
        </div>
      </div>
    </div>
  );
}

