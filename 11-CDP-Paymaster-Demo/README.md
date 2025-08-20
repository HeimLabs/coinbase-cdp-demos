# CDP Paymaster Demo - Gas-Sponsored NFT Minting

A Next.js application demonstrating the power of Coinbase Paymaster for frictionless onboarding. This project showcases gas-sponsored NFT minting, allowing Smart Wallet users to mint NFTs without paying transaction fees, removing a major barrier to onchain adoption.

## 🌟 Features

- **Gas-Sponsored Transactions**: Free NFT minting for Smart Wallet users via Coinbase Paymaster
- **Smart Wallet Detection**: Automatic detection and differentiated UX for Smart Wallet vs EOA users  
- **OnchainKit Integration**: Built with Coinbase's OnchainKit React components
- **Modern UI/UX**: Clean, responsive interface with dark/light mode support
- **Base Sepolia Testnet**: Safe testing environment with testnet tokens
- **Transaction Monitoring**: Real-time transaction status and confirmation tracking
- **Wallet Integration**: Seamless wallet connection with multiple provider support

## 🛠️ Tech Stack

- **Next.js 15**: React framework with App Router
- **OnchainKit**: Coinbase's React components for onchain apps
- **Wagmi**: React hooks for Ethereum
- **Viem**: TypeScript interface for Ethereum
- **Tailwind CSS**: Utility-first CSS framework
- **Base Sepolia**: Layer 2 testnet for low-cost transactions

## 📋 Prerequisites

- Node.js (v18 or later)
- npm, yarn, pnpm, or bun package manager
- A wallet that supports Base Sepolia testnet
- Coinbase Smart Wallet (recommended for gas-free experience)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
cd 11-CDP-Paymaster-Demo

# Install dependencies
npm install
# or
yarn install
# or  
pnpm install
# or
bun install
```

### 2. Environment Setup (Optional)

This demo works out of the box, but you can configure environment variables if needed:

```bash
# Copy the example environment file (if available)
cp .env.example .env
```

Add any required API keys:

```env
# OnchainKit API Key (optional, for enhanced features)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key_here

# Project configuration
NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME=CDP-Paymaster-Demo
```

### 3. Start the Development Server

```bash
npm run dev
# or
yarn dev  
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 How to Use

### For Smart Wallet Users (Gas-Free Experience)

1. **Connect Your Smart Wallet**: Click "Connect Wallet" and select Coinbase Smart Wallet
2. **Automatic Detection**: The app will detect your Smart Wallet and show a green success message
3. **Free Minting**: Click "Mint NFT" to claim your free NFT with zero gas fees
4. **Transaction Success**: Watch as your transaction is processed without any ETH requirement

### For EOA (Externally Owned Account) Users

1. **Connect Your Wallet**: Connect with MetaMask, WalletConnect, or other supported wallets  
2. **Yellow Warning**: You'll see a yellow notification that gas fees will apply
3. **Requires ETH**: Ensure you have sufficient ETH on Base Sepolia for gas fees
4. **Standard Minting**: Proceed with regular transaction that requires gas payment

## 🔧 Technical Details

### Smart Contract Integration

The demo interacts with an NFT contract deployed on Base Sepolia:

```typescript
// NFT Contract Details
const NFT_CONTRACT_ADDRESS = '0x66519FCAee1Ed65bc9e0aCc25cCD900668D3eD49';

// Contract function call
const mintCall = [{
  to: NFT_CONTRACT_ADDRESS,
  data: encodeFunctionData({
    abi: NFT_CONTRACT_ABI,
    functionName: 'mintTo',
    args: [userAddress, 1], // Minting item ID 1
  }),
  value: BigInt(0), // Free mint
}];
```

### Paymaster Integration

Gas sponsorship is enabled through OnchainKit's Transaction component:

```typescript
<Transaction
  isSponsored={true}  // Enables Coinbase Paymaster
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
```

### Architecture

```
11-CDP-Paymaster-Demo/
├── app/
│   ├── page.tsx           # Main application component
│   ├── layout.tsx         # Root layout with providers
│   ├── providers.tsx      # Wagmi and OnchainKit providers
│   ├── globals.css        # Global styles
│   └── svg/              # SVG icon components
├── next.config.mjs        # Next.js configuration  
├── tailwind.config.ts     # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

### Key Features Implementation

1. **Smart Wallet Detection**: Uses Wagmi's `useAccount` hook to detect wallet type
2. **Conditional UI**: Different messaging based on wallet type
3. **Error Handling**: Graceful handling of mint limits and transaction errors
4. **Responsive Design**: Mobile-first design with Tailwind CSS

## 💡 Use Cases

- **Onboarding New Users**: Remove gas fee barriers for blockchain newcomers
- **NFT Campaigns**: Launch promotional NFT drops without user friction
- **Gaming Applications**: Enable free in-game asset minting
- **Educational Demos**: Teach blockchain concepts without requiring ETH
- **Event POAPs**: Distribute proof-of-attendance NFTs at events

## 🔧 Customization

### Modify the NFT Contract

Update the contract address and ABI to use your own NFT contract:

```typescript
const NFT_CONTRACT_ADDRESS = 'your_contract_address_here';
const NFT_CONTRACT_ABI = [
  // Your contract ABI here
];
```

### Customize Minting Parameters

Change the mint function parameters:

```typescript
args: [address, tokenId], // Modify token ID or other parameters
value: BigInt(mintPrice), // Set mint price if not free
```

### UI Customization

The UI can be customized through:

- **Tailwind Classes**: Modify styling in JSX components
- **Theme Colors**: Update color scheme in Tailwind config
- **Component Structure**: Adjust layout in `page.tsx`

## 🛠️ Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint for code quality

### Project Structure

- **Components**: All UI logic in `app/page.tsx` for simplicity
- **Providers**: Wagmi and OnchainKit setup in `app/providers.tsx`
- **Styling**: Tailwind CSS for responsive design
- **Configuration**: Next.js, TypeScript, and Tailwind configs

## 🚀 Production Deployment

For production deployment:

1. **Mainnet Configuration**: Update to Base mainnet if deploying to production
2. **Environment Variables**: Set production API keys and configuration
3. **Contract Verification**: Ensure your NFT contract is verified on Basescan
4. **Rate Limiting**: Implement appropriate rate limiting for mint functions
5. **Error Monitoring**: Add error tracking for production monitoring

## 📖 Additional Resources

- [Coinbase Paymaster Documentation](https://docs.cdp.coinbase.com/paymaster/docs/welcome)
- [OnchainKit Documentation](https://onchainkit.xyz/getting-started)
- [Base Network Documentation](https://docs.base.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)

## 🔒 Security Notes

- This demo is designed for testnet use; review security practices before mainnet deployment
- Never commit private keys or sensitive environment variables
- Implement proper access controls for production NFT contracts
- Monitor gas sponsorship usage to prevent abuse
- Consider implementing mint limits and cooldown periods

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the terms specified in the package.json file.

---

**Disclaimer**: This project is for demonstration purposes. For production use, additional security measures, monitoring, and testing should be implemented. Always test thoroughly on testnets before using mainnet.

---

Built with ❤️ using [OnchainKit](https://onchainkit.xyz/) and [Coinbase Paymaster](https://docs.cdp.coinbase.com/paymaster/docs/welcome).
