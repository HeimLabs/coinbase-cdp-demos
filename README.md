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
