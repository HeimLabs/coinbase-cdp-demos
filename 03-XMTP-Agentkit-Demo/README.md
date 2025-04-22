# XMTP AgentKit Demo

## Overview

This project demonstrates the integration of [XMTP](https://xmtp.org/) (Extensible Message Transport Protocol) with Coinbase [AgentKit](https://docs.developer.coinbase.com/base/agentkit/) to create an AI-powered DeFi payment agent. The agent can interact with users via XMTP messaging to help manage crypto assets, check balances, and process payments on the blockchain.

## Features

- **XMTP Messaging**: Send and receive messages to the agent using any XMTP-compatible client
- **AI-Powered Responses**: Utilizes GPT-4o-mini to provide intelligent and contextual responses
- **Wallet Management**: Creates and manages wallets on behalf of users
- **USDC Payments**: Facilitates USDC token transfers on Base Sepolia testnet
- **Balance Checking**: Query wallet and token balances
- **Persistent Sessions**: Maintains conversation context across sessions

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Coinbase Developer Platform API key
- OpenAI API key

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/HeimLabs/coinbase-cdp-demos
   cd 03-XMTP-Agentkit-Demo
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npx tsc
   ```

4. Generate XMTP keys:
   ```
   node dist/generate-keys.js
   ```

5. Create a `.env` file based on the generated keys and add the required API keys:
   ```
   # XMTP Configuration
   WALLET_KEY=your_generated_wallet_key
   ENCRYPTION_KEY=your_generated_encryption_key
   XMTP_ENV=production  # Options: production, dev

   # OpenAI API Key
   OPENAI_API_KEY=your_openai_api_key

   # Coinbase Developer Platform
   CDP_API_KEY_NAME=your_cdp_api_key_name
   CDP_API_KEY_PRIVATE_KEY=your_cdp_api_key_private_key
   
   # Blockchain Configuration
   NETWORK_ID=base-sepolia
   ```

## Usage

1. Start the agent:
   ```
   node dist/chatbot.js
   ```

2. When the agent starts, it will display a URL that you can use to connect to it using the XMTP.chat web client:
   ```
   Agent initialized on dev network
   Send a message on http://xmtp.chat/dm/0x123...abc?env=dev
   ```

3. Open the provided URL in your browser to start chatting with your agent.

## How It Works

### Architecture

The application consists of two main components:

1. **XMTP Client**: Connects to the XMTP network to send and receive messages
2. **AgentKit + LangChain Agent**: Processes messages using AI and performs blockchain operations

### Message Flow

1. User sends a message to the agent via XMTP
2. Agent receives the message and initializes a user-specific agent instance
3. The message is processed through the LangChain agent with AgentKit tools
4. Agent responds with appropriate actions or information
5. Response is sent back to the user via XMTP

### Wallet Management

- Each user gets a unique CDP wallet that persists across sessions
- Wallet data is stored securely in the `.data/wallets` directory
- The agent can generate new wallets or use existing ones

## Customization

You can customize the agent's behavior by modifying the `messageModifier` in the `createReactAgent` function in `chatbot.ts`. This includes:

- Agent personality
- Response style
- Available tokens and networks
- Error handling behavior

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure your XMTP keys are correct and the XMTP_ENV is set properly
2. **API Key Error**: Verify your Coinbase and OpenAI API keys are valid
3. **Processing Error**: For 5XX errors, try again later; for other errors, check the logs for details

### Debug Logs

Check the console output for detailed logs on:
- Agent initialization
- Message receiving and processing
- Wallet operations
- Error details

## Security Notes

- Wallet and encryption keys are sensitive information. Never share your `.env` file.
- The agent stores wallet data locally. Ensure proper access controls for the host system.
- All transactions happen on testnet by default. For mainnet usage, additional security measures should be implemented.

## License

This project is licensed under the terms specified in the package.json file.

---

*This project is for demonstration purposes only. For production use, additional security measures and testing should be implemented.*