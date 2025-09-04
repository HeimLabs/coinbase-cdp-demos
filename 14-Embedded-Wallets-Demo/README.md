# 🚀 CDP Embedded Wallets Demo

A comprehensive tutorial and demonstration of **Coinbase Developer Platform (CDP) Embedded Wallets** featuring modern authentication, smart accounts, gasless transactions, and seamless crypto experiences.

![CDP Embedded Wallets Demo](https://img.shields.io/badge/Coinbase-CDP-blue?style=for-the-badge&logo=coinbase)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ What You'll Learn

This demo showcases the core features of CDP Embedded Wallets:

- 🔐 **Passwordless Authentication** - Email-based sign-in without seed phrases
- 🧠 **Smart Accounts (ERC-4337)** - Account abstraction capabilities
- 💸 **Token Transfers** - Send ETH seamlessly on Base Sepolia  
- 🛡️ **Secure Infrastructure** - Built on Coinbase's trusted platform

## 🎯 Live Demo Features

### 🔑 Modern Authentication
- **No seed phrases or browser extensions required**
- Email OTP authentication that users already understand
- Secure wallet creation and management handled automatically

### 🚀 Smart Account Capabilities
- **Batch multiple transactions** into a single user operation
- **Gas sponsorship** via Base Paymaster for gasless UX
- **Enhanced security** with social recovery and spending limits
- **Account abstraction** features for improved user experience

### 💰 Token Operations
- **Send ETH** to any address with a user-friendly interface
- **Real-time balance** monitoring and updates
- **Faucet integration** for easy testnet funding

## 🛠️ Technical Architecture

### Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── globals.css      # Tailwind CSS styles
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Main application entry
│
├── components/          # React components
│   ├── ui/              # Reusable UI components
│   │   ├── Card.tsx     # Card component
│   │   └── Button.tsx   # Button variants
│   ├── SmartAccountDemo.tsx # Smart account features
│   ├── TokenTransfer.tsx    # ETH transfer functionality
│   ├── UserBalance.tsx      # Balance display
│   └── SignInScreen.tsx     # Authentication UI
│
└── lib/
    └── utils.ts         # Utility functions
```

### Key Dependencies

- **@coinbase/cdp-core** - Core CDP functionality
- **@coinbase/cdp-hooks** - React hooks for CDP
- **@coinbase/cdp-react** - Pre-built React components  
- **@coinbase/cdp-wagmi** - Wagmi integration
- **viem** - Type-safe Ethereum library
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- A [Coinbase Developer Platform account](https://portal.cdp.coinbase.com)

### 1. Get Your CDP Project ID

1. **Create a CDP account** at [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com)
2. **Create a new project** or use an existing one
3. **Copy your Project ID** from the dashboard
4. **Configure CORS settings**:
   - Go to [Embedded Wallets CORS settings](https://portal.cdp.coinbase.com/products/embedded-wallets/cors)
   - Click "Add origin" and whitelist `http://localhost:3000`

### 2. Environment Setup

```bash
# Clone the repository (if applicable)
git clone <your-repo-url>
cd 14-Embedded-Wallets-Demo

# Copy environment file
cp env.example .env

# Add your CDP Project ID to .env
echo "NEXT_PUBLIC_CDP_PROJECT_ID=your-project-id-here" > .env
```

### 3. Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or with other package managers
yarn dev    # Yarn
pnpm dev    # PNPM
```

Visit [http://localhost:3000](http://localhost:3000) to see your app! 🎉

## 📚 Tutorial Walkthrough

### Step 1: Authentication Experience
1. **Open the demo** and see the modern sign-in interface
2. **Enter your email** to receive an OTP
3. **Notice how simple it is** - no MetaMask, no seed phrases!

### Step 2: Explore Your Wallet
1. **View wallet information** - address, user details, features
2. **Check your balance** on Base Sepolia testnet
3. **Copy your address** for easy sharing

### Step 3: Get Test Funds
1. **Visit the Base Sepolia faucet** (linked in the app)
2. **Enter your wallet address** to receive test ETH
3. **Watch your balance update** automatically

### Step 4: Try Smart Account Features
1. **Send a batched transaction** with multiple operations
2. **Experience gasless UX** - no ETH needed for gas!
3. **View transaction details** on BaseScan

### Step 5: Transfer Tokens
1. **Use the token transfer component**
2. **Send ETH to another address** (try the quick-fill demo)
3. **Track the transaction** in real-time

### Step 6: Experience the Benefits
1. **Notice the simplicity** - no complex wallet management
2. **See how transactions work** with familiar web patterns
3. **Understand the developer experience** - just a few hooks!

## 🔧 Customization Guide

### Adding New Features

```typescript
// Example: Add a new wallet feature component
import { useEvmAddress } from "@coinbase/cdp-hooks";

export function MyWalletFeature() {
  const { evmAddress } = useEvmAddress();
  
  // Your custom logic here
  return (
    <Card>
      <CardContent>
        {/* Your UI here */}
      </CardContent>
    </Card>
  );
}
```

### Styling Customization

The demo uses Tailwind CSS with a custom design system. Key colors and components can be customized in:

- `src/app/globals.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind configuration
- `src/components/ui/` - Base UI components

### Network Configuration

To use different networks, update the network configuration in your components:

```typescript
// Change from Base Sepolia to Base Mainnet
const transaction = {
  // ... other properties
  chainId: 8453, // Base Mainnet
  network: "base" // Network identifier
};
```

## 🏗️ Production Considerations

### Security Best Practices

1. **Environment Variables**: Never expose sensitive keys in client code
2. **CORS Configuration**: Properly configure allowed origins in production
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Error Handling**: Add comprehensive error handling and logging

### Performance Optimizations

1. **Component Lazy Loading**: Use React.lazy for large components
2. **API Caching**: Implement proper caching strategies
3. **Bundle Optimization**: Analyze and optimize bundle size
4. **Image Optimization**: Use Next.js Image component

### Deployment Checklist

- [ ] Update CORS settings for production domain
- [ ] Configure environment variables securely
- [ ] Set up monitoring and analytics
- [ ] Test with real user flows
- [ ] Implement proper error boundaries

## 🔗 Resources & Documentation

### CDP Documentation
- [📖 Embedded Wallets Docs](https://docs.cdp.coinbase.com/embedded-wallets/welcome)
- [🎣 React Hooks Reference](https://docs.cdp.coinbase.com/embedded-wallets/react-hooks)
- [🧩 React Components Guide](https://docs.cdp.coinbase.com/embedded-wallets/react-components)
- [🔐 Authentication Guide](https://docs.cdp.coinbase.com/embedded-wallets/end-user-authentication)

### Smart Accounts & Paymaster
- [🧠 Smart Accounts Overview](https://docs.cdp.coinbase.com/embedded-wallets/smart-accounts)
- [⛽ Base Paymaster Guide](https://docs.cdp.coinbase.com/paymaster/guides/paymaster-masterclass)
- [💳 Gasless Transactions](https://docs.cdp.coinbase.com/paymaster/introduction/welcome)

### Onramp & Integration
- [💰 Onramp API Docs](https://docs.cdp.coinbase.com/onramp-&-offramp/introduction/welcome)
- [🍎 Apple Pay Integration](https://docs.cdp.coinbase.com/onramp-&-offramp/onramp-apis/apple-pay-onramp-api)
- [🔗 Widget Customization](https://docs.cdp.coinbase.com/onramp-&-offramp/onramp-apis/generating-onramp-url)

### Community & Support
- [🎮 CDP Discord](https://discord.gg/coinbasedev)
- [🐛 GitHub Issues](https://github.com/coinbase/cdp-sdk)
- [📧 Developer Support](https://support.coinbase.com/contact-us)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Coinbase Developer Platform** team for the amazing SDK
- **Base** team for the robust L2 infrastructure  
- **Open source community** for the excellent tooling

---

**Built with ❤️ by the Coinbase Developer Platform Team**

*Ready to build the future of embedded wallets? [Get started today!](https://portal.cdp.coinbase.com)*
