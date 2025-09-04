# CDP Staking Demo - ETH Staking Interface

A modern Next.js application demonstrating ETH staking capabilities using the Coinbase Developer Platform (CDP) SDK. This project showcases how to build an intuitive staking interface with real-time balance tracking, staking operations, and seamless wallet integration.

## 🌟 Features

- **ETH Staking Operations**: Stake and unstake ETH with intuitive UI controls
- **Real-time Balance Tracking**: Monitor staking balances and rewards in real-time
- **CDP SDK Integration**: Leverages Coinbase Developer Platform for secure staking operations
- **Modern UI/UX**: Clean, responsive interface built with React and Tailwind CSS
- **Wallet Integration**: Seamless wallet connection using ConnectKit
- **Base Network Support**: Built for Base network integration
- **TypeScript Implementation**: Fully typed codebase for better development experience

## 🛠️ Tech Stack

- **Next.js 15**: React framework with App Router and Turbopack
- **Coinbase CDP SDK**: Core staking functionality and wallet management
- **ConnectKit**: Wallet connection and management
- **Wagmi & Viem**: Ethereum interaction libraries
- **React Query**: Data fetching and state management
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe development environment

## 📋 Prerequisites

- Node.js (v18 or later)
- npm, yarn, pnpm, or bun package manager
- A wallet that supports Ethereum staking
- Coinbase Developer Platform API key (for advanced features)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
cd 13-CDP-Staking-Demo

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

```bash
# Copy the example environment file (if available)
cp .env.example .env
```

Add any required configuration:

```env
# CDP API Key (optional, for enhanced features)
CDP_API_KEY_NAME=your_api_key_name_here
CDP_API_KEY_PRIVATE_KEY=your_private_key_here

# Network Configuration
NEXT_PUBLIC_NETWORK=base
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

### Connecting Your Wallet

1. **Click "Connect Wallet"** to open the wallet selection modal
2. **Choose your preferred wallet** (MetaMask, Coinbase Wallet, WalletConnect, etc.)
3. **Approve the connection** and ensure you're on the correct network

### Staking ETH

1. **Enter the amount** of ETH you want to stake
2. **Review the staking details** including estimated rewards
3. **Click "Stake ETH"** and confirm the transaction in your wallet
4. **Monitor your staking position** in real-time

### Managing Your Stakes

1. **View your active stakes** in the dashboard
2. **Track rewards accumulation** with live updates
3. **Unstake when ready** by clicking the unstake button
4. **Claim rewards** as they become available

## 🔧 Technical Details

### Architecture

```
13-CDP-Staking-Demo/
├── app/
│   ├── page.tsx           # Main staking interface
│   ├── layout.tsx         # Root layout with providers
│   ├── globals.css        # Global styles and Tailwind
│   └── providers.tsx      # Wagmi and React Query providers
├── next.config.ts         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration  
└── tsconfig.json         # TypeScript configuration
```

### Key Components

1. **Staking Interface**: Interactive UI for staking operations
2. **Balance Display**: Real-time ETH and staked balance tracking
3. **Transaction Management**: Handle staking and unstaking transactions
4. **Wallet Integration**: ConnectKit-powered wallet connection

### Staking Flow

```typescript
// Example staking operation
const stakeETH = async (amount: string) => {
  try {
    // Prepare staking transaction
    const transaction = await prepareStakeTransaction(amount);
    
    // Execute via CDP SDK
    const result = await cdp.stake({
      amount: parseEther(amount),
      validator: selectedValidator,
    });
    
    console.log('Staking successful:', result.transactionHash);
  } catch (error) {
    console.error('Staking failed:', error);
  }
};
```

## 💡 Use Cases

- **Individual Staking**: Personal ETH staking with user-friendly interface
- **Portfolio Management**: Track multiple staking positions
- **Educational Demo**: Learn about Ethereum staking mechanisms
- **DApp Integration**: Reference implementation for staking features
- **Yield Farming**: Explore staking rewards and strategies

## 🔧 Customization

### Modify Staking Parameters

Update staking configuration in your components:

```typescript
const stakingConfig = {
  minimumStake: parseEther('0.01'), // Minimum stake amount
  maxStake: parseEther('32'),       // Maximum stake per operation
  validator: '0x....',              // Preferred validator address
  network: 'base',                  // Target network
};
```

### UI Customization

The interface can be customized through:

- **Tailwind Classes**: Modify styling directly in components
- **CSS Variables**: Update theme colors in `globals.css`
- **Component Structure**: Adjust layout in `page.tsx`

### Network Configuration

Switch networks by updating the Wagmi configuration:

```typescript
const config = createConfig({
  chains: [mainnet, base], // Add or modify supported chains
  connectors: [
    // Wallet connectors
  ],
});
```

## 🛠️ Development

### Available Scripts

- `npm run dev`: Start development server with Turbopack
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint for code quality

### Adding New Features

1. **New Staking Strategies**: Extend with additional staking mechanisms
2. **Reward Tracking**: Implement detailed reward analytics
3. **Multi-Asset Support**: Add support for other stakeable assets
4. **Advanced UI**: Build more sophisticated user interfaces

## 🚀 Production Deployment

For production deployment:

1. **Environment Variables**: Set production API keys and configuration
2. **Network Configuration**: Update to mainnet if deploying to production
3. **Security Review**: Audit smart contract interactions
4. **Performance Optimization**: Implement caching and optimization strategies
5. **Monitoring**: Add error tracking and analytics

## 📖 Additional Resources

- [Coinbase Developer Platform Documentation](https://docs.cdp.coinbase.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)

## 🔒 Security Notes

- This demo is designed for educational purposes; review security practices before mainnet deployment
- Never commit private keys or sensitive environment variables
- Implement proper validation for staking amounts and parameters
- Consider slashing risks and validator selection carefully
- Test thoroughly on testnets before using real ETH

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Disclaimer**: This project is for demonstration purposes. Staking involves risks including potential loss of funds due to slashing. Always do your own research and consider the risks before staking real ETH.

---

Built with ❤️ using [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)