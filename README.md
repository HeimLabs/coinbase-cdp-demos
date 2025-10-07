# Coinbase Developer Platform (CDP) Demos

This repository contains a collection of demonstration projects showcasing the capabilities of the Coinbase Developer Platform (CDP) and AgentKit framework for building powerful blockchain applications and AI agents.

## Overview

The Coinbase Developer Platform (CDP) provides developers with tools to easily build secure blockchain applications. This repository contains several demo projects that demonstrate different aspects of CDP's capabilities, particularly focused on AgentKit, which allows developers to create AI agents that can interact with blockchain networks.

## Demo Projects

### 1. AgentKit Demo - Custom Action (Uniswap V2)

A command-line interface (CLI) chatbot that demonstrates how to implement custom blockchain actions using AgentKit. This project showcases a custom Uniswap V2 action provider for swapping ETH to USDC on the Base Sepolia testnet.

**Key Features:**
- CLI Interface with chat and autonomous modes
- Custom Uniswap V2 Action for ETH to USDC swaps
- CDP Wallet Integration with persistent storage
- GPT-4o Integration

[View Demo](/01.AgentKit%20Demo%20-%20Custom%20Action%28Uniswap%20V2%29)

### 2. Full-Stack AgentKit

A full-stack web application that demonstrates integrating AgentKit into a modern web application framework. This project showcases how to build user-friendly interfaces for blockchain AI agents.

**Key Features:**
- Web-based interface for interacting with blockchain
- Integration with modern frontend frameworks
- Responsive design for multiple devices
- Secure wallet management

[View Demo](/02-Full-Stack-AgentKit)

### 3. XMTP AgentKit Demo

This project demonstrates the integration of XMTP (Extensible Message Transport Protocol) with Coinbase AgentKit to create an AI-powered DeFi payment agent. The agent can interact with users via XMTP messaging to help manage crypto assets, check balances, and process payments.

**Key Features:**
- XMTP Messaging via any compatible client
- AI-Powered Responses with GPT-4o-mini
- Wallet Management for users
- USDC Payments on Base Sepolia testnet
- Persistent conversation sessions

[View Demo](/03-XMTP-Agentkit-Demo)

### 4. CDP Agent - Automated On-Chain Actions

An autonomous Node.js agent that uses the Coinbase Developer Platform (CDP) SDK to provision accounts on Base Sepolia, monitor Ethereum prices via CoinGecko, and trigger automated on-chain actions (e.g., USDC transfer) when predefined price thresholds are met.

**Key Features:**
- Automated EOA & Smart Account creation using CDP SDK
- Testnet ETH funding for Smart Accounts via CDP Faucet
- Scheduled ETH price monitoring (CoinGecko API & `node-cron`)
- Conditional on-chain transactions (e.g., USDC transfer on Base Sepolia)
- Built with TypeScript, configured via environment variables

[View Demo](/04-CDP-Agent)

### 5. CDP Wallets Backend

A comprehensive Node.js backend service demonstrating CDP wallet management with x402 payment integration. This project showcases how to build secure backend services for blockchain applications with payment-protected endpoints.

**Key Features:**
- RESTful API with Express.js framework
- CDP wallet creation and management
- x402 payment middleware for endpoint protection
- Comprehensive error handling and logging
- Production-ready architecture patterns

[View Demo](/05-CDP-Wallets-Backend)

### 6. x402 Seller Demo

A demonstration of creating payment-protected API services using the x402 micropayment protocol. This project shows how to monetize API endpoints with cryptocurrency payments on Base Sepolia.

**Key Features:**
- Payment-protected weather API endpoints
- x402 middleware integration
- Base Sepolia testnet payments
- Automatic payment verification
- Mock data generation for testing

[View Demo](/06-x402-Seller-Demo)

### 7. x402 Pinata Client Demo

A client application demonstrating how to consume x402-protected services, specifically for uploading files to IPFS via Pinata's payment-protected endpoints.

**Key Features:**
- IPFS file upload via Pinata x402 API
- CDP wallet integration for payments
- File upload progress tracking
- Error handling and retry logic
- TypeScript implementation

[View Demo](/07-x402-Pinata-Client-Demo)

### 8. CDP Wallets Policies Demo

A demonstration of CDP wallet policy management for controlling transaction permissions. This project shows how to implement account-level policies that restrict transactions based on various criteria.

**Key Features:**
- Account-level policy creation and management
- Transaction restrictions based on ETH value and addresses
- Policy testing with compliant and violating transactions
- Faucet integration for testnet funding
- Comprehensive policy configuration examples

[View Demo](/08-CDP-Wallets-Policies-Demo)

### 9. x402 MCP Gateway Demo

A comprehensive demonstration of the x402 payment protocol with MCP (Model Context Protocol) integration. This project combines both service provider and client functionality for AI/LLM tool consumption.

**Key Features:**
- Dual x402 architecture (provider + client)
- MCP server integration for AI/LLM tools
- Express API gateway with payment protection
- Pinata IPFS integration with x402 payments
- Multi-network support (Base Sepolia + Base mainnet)

[View Demo](/09-x402-MCP-Gateway-Demo)

### 10. CDP Swap API Demo

A comprehensive demonstration of CDP's token swapping capabilities on Base mainnet. This project shows both the recommended all-in-one approach and the advanced create-then-execute pattern for token swapping.

**Key Features:**
- Token swapping between ERC20 tokens (WETH to USDC example)
- Dual approaches: All-in-one pattern (recommended) and create-then-execute pattern
- Automatic allowance management for ERC20 tokens
- Slippage protection with configurable tolerance
- Real-time transaction monitoring and confirmation
- Full TypeScript implementation

[View Demo](/10-CDP-SwapAPI-Demo)

### 11. CDP Paymaster Demo - Gas-Sponsored NFT Minting

A Next.js application demonstrating the power of Coinbase Paymaster for frictionless onboarding. This project showcases gas-sponsored NFT minting, allowing Smart Wallet users to mint NFTs without paying transaction fees.

**Key Features:**
- Gas-sponsored transactions for Smart Wallet users via Coinbase Paymaster
- Smart Wallet detection with differentiated UX for Smart Wallet vs EOA users
- OnchainKit integration with modern UI/UX
- Base Sepolia testnet with safe testing environment
- Real-time transaction monitoring and confirmation tracking

[View Demo](/11-CDP-Paymaster-Demo)

### 12. CDP MiniKit Demo - Farcaster Mini App Showcase

A comprehensive MiniKit demonstration showcasing Coinbase Developer Platform (CDP) features within a Farcaster mini app. This project demonstrates Base Accounts (Smart Wallets), gas-sponsored transactions, onchain identity, notifications, and more.

**Key Features:**
- Complete CDP showcase with all major features in one mini app
- Base Account integration with seamless Smart Wallet connection
- Gas-sponsored POA NFT minting via Coinbase Paymaster
- Onchain identity with ENS name resolution, avatars, and badges
- Farcaster Frame integration with account association
- Background notifications using Redis-backed webhook system

[View Demo](/12-Minikit-Demo)

### 13. CDP Staking Demo - ETH Staking Interface

A Next.js application demonstrating ETH staking capabilities using the Coinbase Developer Platform SDK. This project showcases how to build a modern staking interface with real-time balance tracking and staking operations.

**Key Features:**
- ETH staking and unstaking operations
- Real-time staking rewards tracking
- Wallet integration with CDP SDK
- Modern React UI with Tailwind CSS
- ConnectKit wallet connection
- Base network integration

[View Demo](/13-CDP-Staking-Demo)

### 14. CDP Embedded Wallets Demo - Passwordless Authentication

A comprehensive tutorial and demonstration of Coinbase Developer Platform (CDP) Embedded Wallets featuring modern authentication, smart accounts, gasless transactions, and seamless crypto experiences.

**Key Features:**
- Passwordless email-based authentication without seed phrases
- Smart Accounts (ERC-4337) with account abstraction capabilities
- Gasless token transfers on Base Sepolia
- Built-in faucet integration for testnet funding
- Modern React UI with TypeScript
- Real-time balance monitoring

[View Demo](/14-Embedded-Wallets-Demo)

### 15. CDP Wallets Solana Agent - Cross-Chain Operations

An autonomous agent demonstrating Coinbase Developer Platform's Solana integration capabilities. This project showcases account provisioning, funding, transactions, and advanced Solana features like batch operations and sponsored transactions.

**Key Features:**
- Automated Solana account creation and management via CDP
- SOL faucet integration for testnet funding
- Standard and batched SOL transfers
- Sponsored transactions for gasless UX
- Off-chain message signing capabilities
- TypeScript implementation with full Solana Web3.js integration

[View Demo](/15-CDP-Wallets-Solana-Agent)


### 16. CDP SQL API Demo — Onchain Data via SQL

Query onchain data from the Base network using the Coinbase Developer Platform SQL API with a simple Node.js CLI. Includes latest block query and a whale-watching example for large USDC transfers.

**Key Features:**
- Query onchain data with CDP SQL API
- Latest block details on Base
- Whale-watching for recent USDC transfers
- Simple CLI with configurable sample limit
- dotenv-based configuration

[View Demo](/16-CDP-SQL-API-Demo)


### 17. Base Accounts Demo — Smart Wallet UX Tutorial

A Next.js tutorial showcasing Base Account features: SIWE sign-in, gas sponsorship via Paymaster, batch transactions, sub-accounts, spend permissions (USDC on Base mainnet), typed data signing, and Base Pay one-tap payments.

**Key Features:**
- Sign in with Base (SIWE)
- Gas Sponsorship (Paymaster)
- Batch Transactions (EIP-5792 v2)
- Sub-Accounts (create/list)
- Spend Permissions (USDC on Base mainnet)
- Typed Data Signing (EIP-712)
- Base Pay integration (testnet)

[View Demo](/17-Base-Accounts-Demo)


### 18. CDP Onchain Automation — Autonomous Fee Collector

An autonomous Node.js agent that monitors Base mainnet USDC transfers with the CDP SQL API and forwards a 5% platform fee to a treasury account. Includes provisioning of managed EVM accounts and periodic balance reporting.

**Key Features:**
- Managed EVM account provisioning
- SQL API monitoring of USDC Transfer events
- Automatic 5% fee forwarding
- Treasury balance reporting

[View Demo](/18-CDP-Onchain-Automation)


## Getting Started

Each demo project contains its own README with detailed setup and usage instructions. To get started:

1. Clone this repository:
   ```bash
   git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
   cd coinbase-cdp-demos
   ```

2. Navigate to the demo project of your choice:
   ```bash
   cd "01.AgentKit Demo - Custom Action(Uniswap V2)"
   # OR
   cd 02-Full-Stack-AgentKit
   # OR
   cd 03-XMTP-Agentkit-Demo
   # OR
   cd 04-CDP-Agent
   # OR
   cd 05-CDP-Wallets-Backend
   # OR
   cd 06-x402-Seller-Demo
   # OR
   cd 07-x402-Pinata-Client-Demo
   # OR
   cd 08-CDP-Wallets-Policies-Demo
   # OR
   cd 09-x402-MCP-Gateway-Demo
   # OR
   cd 10-CDP-SwapAPI-Demo
   # OR
   cd 11-CDP-Paymaster-Demo
   # OR
   cd 12-Minikit-Demo
   # OR
   cd 13-CDP-Staking-Demo
   # OR
   cd 14-Embedded-Wallets-Demo
   # OR
   cd 15-CDP-Wallets-Solana-Agent
   # OR
   cd 16-CDP-SQL-API-Demo
   # OR
   cd 17-Base-Accounts-Demo
   # OR
   cd 18-CDP-Onchain-Automation
   ```

3. Follow the project-specific README for detailed setup instructions.

## Prerequisites

The following prerequisites are common across most demos:

- Node.js (v16 or later)
- npm or yarn package manager
- Coinbase Developer Platform (CDP) API key
- OpenAI API key

## Resources

- [Coinbase Developer Platform Documentation](https://docs.cdp.coinbase.com/)
- [Base Network](https://docs.base.org/)

## License

This project is licensed under the terms specified in the package.json files of individual demo projects.

---

*These demos are for educational purposes only. For production use, additional security measures and testing should be implemented.*
