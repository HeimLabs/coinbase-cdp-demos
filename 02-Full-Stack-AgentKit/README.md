# Uniswap V2 Agent with AgentKit

A sophisticated full stack AI-powered agent that enables conversational interactions to perform Uniswap V2 token swaps on the Base Sepolia testnet. This project was bootstrapped with `create-onchain-agent` by Coinbase's AgentKit and demonstrates how to extend AgentKit with custom action providers for DeFi protocols.

![Uniswap V2 Agent](https://docs.uniswap.org/assets/images/logo-69f6e7de3b22669193e963d553b7f4fc.svg)

## 🌟 Features

- **Full Stack Implementation**: Complete solution with Next.js frontend and backend API routes
- **Created with create-onchain-agent**: Leverages AgentKit's official starter template
- **AI-Driven Interface**: Natural language conversations to execute crypto swaps
- **Custom Uniswap V2 Actions**: ETH to USDC swaps on Base Sepolia testnet
- **CDP Wallet Integration**: Secure wallet management using Coinbase Developer Platform
- **Persistent Wallet Storage**: Wallet data is saved locally between sessions
- **Interactive Web UI**: Modern Next.js interface for seamless user experience
- **Secure Key Management**: Environment variables for sensitive API credentials

## Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- Coinbase Developer Platform (CDP) API key
- OpenAI API key

## Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos
cd uniswap-v2-agent

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and add your API keys:

```
# OpenAI API Key - Required for the AI component
OPENAI_API_KEY=your_openai_api_key

# Coinbase Developer Platform Keys
CDP_API_KEY_NAME=your_cdp_api_key_name
CDP_API_KEY_PRIVATE_KEY=your_cdp_api_key_private_key

# Network Configuration
NETWORK_ID=base-sepolia
```

### 3. Start the Application

```bash
# Development mode with hot reloading
npm run dev

# Or build and run in production mode
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to interact with your agent.

## Using the Agent

Once the application is running, you can interact with the agent through the web interface. The agent understands commands related to:

- Checking wallet address and balance
- Swapping ETH to USDC on Uniswap V2
- Getting token price information

Example prompts:

- "What's my wallet address?"
- "Swap 0.01 ETH to USDC"
- "What's the current price of ETH?"
- "Tell me about Uniswap V2"

## Technical Details

### Custom Uniswap V2 Integration

This project features a custom action provider for Uniswap V2 operations:

- `uniswapV2ActionProvider.ts`: Implements the swap_eth_to_usdc action
- Supports ETH to USDC swaps on Base Sepolia testnet
- Uses the Uniswap V2 Router at address `0x1689E7B1F10000AE47eBfE339a4f69dECd19F602`

### Architecture

```
uniswap-v2-agent/
├── app/                    # Next.js application
│   ├── api/agent/          # AgentKit API routes
│   │   ├── create-agent.ts # Agent instantiation
│   │   ├── prepare-agentkit.ts # AgentKit setup
│   │   └── route.ts        # API route handler
│   ├── page.tsx            # Main UI component
│   └── ...                 # Other UI components
├── uniswapV2ActionProvider.ts # Custom Uniswap V2 action provider
├── schemas.ts              # Zod schemas for action validation
└── wallet_data.txt         # Persisted wallet data
```

### Key Components

1. **AgentKit Integration**: The `/app/api/agent/prepare-agentkit.ts` file configures AgentKit with various action providers, including the custom Uniswap V2 provider.

2. **Custom Action Provider**: The `uniswapV2ActionProvider.ts` implements the `swap_eth_to_usdc` action, which allows users to swap ETH for USDC tokens on Uniswap V2.

3. **Wallet Management**: Uses CDP's MPC wallet for secure transaction signing and execution, with wallet data persistence between sessions.

4. **Next.js UI**: Modern web interface built with Next.js, React, and Tailwind CSS.

## Development

### Project Structure

- `/app`: Next.js application with UI components and API routes
- `/app/api/agent`: AgentKit integration and agent configuration
- `uniswapV2ActionProvider.ts`: Custom Uniswap V2 action provider
- `schemas.ts`: Zod schemas for action input validation

### Adding New Features

To extend the agent with additional capabilities:

1. Create a new action provider (see `uniswapV2ActionProvider.ts` as example)
2. Add any required schemas to `schemas.ts`
3. Register your provider in `/app/api/agent/prepare-agentkit.ts`

### Testing Your Changes

```bash
# Run in development mode
npm run dev

# Run linting
npm run lint
```

## Additional Resources

- [AgentKit Documentation](https://docs.developer.coinbase.com/base/agentkit/)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- [Uniswap V2 Documentation](https://docs.uniswap.org/contracts/v2/overview)
- [Next.js Documentation](https://nextjs.org/docs)

## Security Notes

- Never commit your `.env` file or expose API keys
- The project uses testnet by default; be cautious if deploying to mainnet
- Review the CDP API key permissions for production deployments

## License

This project is licensed under the terms specified in the package.json file.

---

**Disclaimer**: This project is for demonstration purposes. Use at your own risk when deploying to production environments or mainnet networks.

---

Built with ❤️ using [AgentKit](https://github.com/coinbase/agentkit) by Coinbase.
