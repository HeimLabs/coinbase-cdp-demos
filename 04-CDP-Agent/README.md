# Project Title: CDP Agent - Automated On-Chain Actions

## Overview

The CDP Agent is a Node.js and TypeScript-based application that demonstrates how to build an autonomous agent using the Coinbase Developer Platform (CDP) SDK. This agent performs the following key operations:

1.  **Account Provisioning:** Automatically provisions an Externally Owned Account (EOA) to serve as an owner and a Smart Account on the Base Sepolia testnet using the CDP SDK.
2.  **Funding:** Funds the newly created Smart Account with Base Sepolia ETH using the CDP Faucet service.
3.  **Price Monitoring:** Periodically (every minute, using `node-cron`) fetches the current price of Ethereum (ETH) in USD from the CoinGecko API.
4.  **Automated On-Chain Action:** If the ETH price exceeds a predefined threshold (e.g., $2600 USD), the agent triggers an on-chain transaction. The default action is to send a predefined amount of USDC tokens on the Base Sepolia network to a specified recipient address.

This project serves as a practical example of leveraging CDP SDK for automated wallet management, smart account interaction, and conditional on-chain operations based on real-world data.

## Features

-   **Automated EOA & Smart Account Creation:** Leverages CDP SDK for seamless account provisioning on Base Sepolia.
-   **Testnet Funding:** Integrates with CDP Faucet for automatic Smart Account funding.
-   **Scheduled Price Monitoring:** Uses `node-cron` for regular ETH price checks via CoinGecko.
-   **Conditional On-Chain Transactions:** Executes a smart contract interaction (USDC transfer) when price conditions are met.
-   **TypeScript-based:** Modern, type-safe codebase.
-   **Environment Variable Configuration:** Securely manages API keys and other configurations.

## Tech Stack

-   **Node.js:** JavaScript runtime environment.
-   **TypeScript:** Superset of JavaScript for type safety.
-   **Coinbase CDP SDK (`@coinbase/cdp-sdk`):** For interacting with Coinbase Developer Platform services (Wallet API v2).
-   **Viem:** For Ethereum Virtual Machine (EVM) interactions, such as encoding function data and interacting with the public client.
-   **Axios:** For making HTTP requests to external APIs (CoinGecko).
-   **Dotenv:** For loading environment variables from a `.env` file.
-   **Node-cron:** For scheduling tasks (price monitoring).

## Project Structure

-   `src/agent.ts`: Core logic of the agent, including account provisioning, price monitoring, and on-chain actions.
-   `dist/`: Compiled JavaScript output (after running `npm run build`).
-   `.env`: File for storing environment variables (you need to create this).
-   `package.json`: Project metadata, dependencies, and scripts.
-   `tsconfig.json`: TypeScript compiler configuration.

## Getting Started

### Prerequisites

-   **Node.js:** Version 18.x or later recommended.
-   **Coinbase Cloud Platform (CDP) Credentials:**
    -   `CDP_API_KEY_ID`
    -   `CDP_API_KEY_SECRET`
    -   `CDP_WALLET_SECRET`
    You can obtain these by creating an API key in the Coinbase Developer Platform with the necessary permissions for Wallet API v2.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
    cd 04-CDP-Agent
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory (`04-CDP-Agent/.env`) and add your CDP credentials:
    ```env
    CDP_API_KEY_ID=your_cdp_api_key_id
    CDP_API_KEY_SECRET=your_cdp_api_key_secret
    CDP_WALLET_SECRET=your_cdp_wallet_secret

    # Optional: You can override these default values from src/agent.ts here if needed
    # PRICE_API_URL=https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd
    # TARGET_PRICE_THRESHOLD=2600
    # BASE_SEPOLIA_USDC_ADDRESS="0x036CbD53842c5426634e7929541eC2318f3dCF7e"
    # TARGET_RECIPIENT_ADDRESS="0xB207F0CE9D53DBFC5C7c2f36A8b00b3315464529"
    ```
    **Important:** Ensure the `TARGET_RECIPIENT_ADDRESS` is an address you control on Base Sepolia if you want to receive the test USDC.

### Building the Project

The project uses TypeScript. You need to compile it to JavaScript before running:
```bash
npm run build
```
This command runs `tsc` and outputs the compiled files to the `dist/` directory.

### Running the Application

After building the project, you can start the agent:
```bash
npm start
```
This command executes `node dist/agent.js`. The agent will then:
1.  Initialize the CDP client.
2.  Provision an EOA and a Smart Account.
3.  Fund the Smart Account.
4.  Start the cron job to monitor ETH prices every minute.

## Usage

Once the agent is running (`npm start`):
-   It will log its actions to the console, including account creation, funding, and periodic price checks.
-   If the ETH price (from CoinGecko) surpasses the `TARGET_PRICE_THRESHOLD` (default $2600, configurable in `src/agent.ts` or `.env`), it will attempt to send 1 USDC (test tokens) on Base Sepolia from the agent's Smart Account to the `TARGET_RECIPIENT_ADDRESS`.
-   The default USDC contract address on Base Sepolia is `0x036CbD53842c5426634e7929541eC2318f3dCF7e`.
-   You can monitor the agent's Smart Account and the recipient address on a Base Sepolia block explorer.

To stop the agent, press `Ctrl+C` in the terminal where it's running.

### Configuration

Key parameters can be modified directly in `src/agent.ts` or by setting corresponding environment variables (if you adapt the script to read them):
-   `PRICE_API_URL`: The API endpoint for fetching price data.
-   `TARGET_PRICE_THRESHOLD`: The ETH price in USD that triggers the on-chain action.
-   `BASE_SEPOLIA_USDC_ADDRESS`: The address of the USDC token contract on Base Sepolia.
-   `TARGET_RECIPIENT_ADDRESS`: The address to which USDC will be sent.
-   `CRON_SCHEDULE`: The cron pattern for price monitoring (default is `'* * * * *'` for every minute).

## Development

-   The main application logic is in `src/agent.ts`.
-   After making changes to TypeScript files in `src/`, remember to rebuild the project using `npm run build`.

## License

This project is licensed under the ISC License. See the `LICENSE` file for details (though one isn't explicitly present, `package.json` declares ISC).

*This project is for demonstration purposes only. For production use, additional security measures and testing should be implemented.*
