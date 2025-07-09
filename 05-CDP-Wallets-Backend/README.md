# CDP Wallets Backend

A Node.js backend service that provides API endpoints for wallet management and transactions on the Base Sepolia network using Coinbase's CDP SDK and Viem for Ethereum interactions.

## 🌟 Features

- **Wallet Management**: Create and manage wallets using CDP SDK
- **Faucet Integration**: Request testnet funds via CDP Faucet
- **Batch Transactions**: Send ETH to multiple recipients in batch
- **x402 Payment Middleware**: Monetize API access with micro-payments
- **Well-Wisher Messages**: Protected endpoint requiring payment
- **TypeScript**: Full TypeScript implementation for type safety
- **Viem Integration**: Ethereum interactions using Viem library

## 🛠️ Tech Stack

- **Node.js**: JavaScript runtime environment
- **TypeScript**: Type-safe JavaScript superset
- **Express.js**: Web application framework
- **Coinbase CDP SDK**: Wallet API v2 integration
- **Viem**: Ethereum Virtual Machine (EVM) interactions
- **x402-express**: Payment middleware for API monetization

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- Coinbase Developer Platform (CDP) API credentials
- Private key for wallet operations

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
cd 05-CDP-Wallets-Backend

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and add your credentials:

```env
# Server Configuration
PORT=3001

# Coinbase Developer Platform API Keys
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret
CDP_WALLET_SECRET=your_cdp_wallet_secret
```

### 3. Build and Start

```bash
# Build the TypeScript code
npm run build

# Start the server
npm start

# Or for development with auto-reload
npm run dev
```

The server will start on `http://localhost:3001` (or your specified PORT).

## 📚 API Endpoints

### Wallet Management

#### Create Wallet
```bash
POST /wallets
Content-Type: application/json

{
  "name": "My Wallet",
  "assignedTo": "user123",
  "network": "base-sepolia"
}
```

#### Create User Wallet
```bash
POST /users/wallet
Content-Type: application/json

{
  "username": "johndoe"
}
```

#### Request Faucet Funds
```bash
POST /wallets/:walletAddress/faucet
Content-Type: application/json

{
  "network": "base-sepolia",
  "token": "eth"
}
```

#### Send Batch ETH
```bash
POST /wallets/:walletAddress/send-batch-eth
Content-Type: application/json

{
  "recipients": ["0x123...", "0x456..."],
  "amountPerRecipient": "0.01"
}
```

### Protected Endpoints

#### Get Well-Wisher Messages (Requires Payment)
```bash
GET /wellWisherMessages
# Requires x402 payment of $1 on base-sepolia
```

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3001)
- `PRIVATE_KEY`: Private key for wallet operations
- `CDP_API_KEY_ID`: CDP API key identifier
- `CDP_API_KEY_SECRET`: CDP API key secret
- `CDP_WALLET_SECRET`: CDP wallet encryption secret

### Supported Networks

Currently supports:
- **Base Sepolia**: Testnet for development and testing

### Payment Middleware

The service uses x402-express middleware for monetizing API access. The `/wellWisherMessages` endpoint requires a $1 payment on base-sepolia.

## 🏗️ Architecture

```
src/
├── server.ts          # Main Express server and API routes
├── cdpClient.ts       # CDP SDK client initialization
└── viemClient.ts      # Viem public client configuration
```

### Key Components

1. **CDP Client Manager**: Singleton pattern for CDP SDK client
2. **Viem Integration**: Public client for blockchain interactions
3. **Wallet Management**: In-memory storage for managed wallets
4. **Batch Transaction Processing**: Concurrent transaction submission with retry logic
5. **Payment Middleware**: x402 integration for API monetization

## 🔄 API Response Examples

### Successful Wallet Creation
```json
{
  "walletId": "user123-1640995200000",
  "address": "0x742d35Cc6634C0532925a3b8d8C2f66A67B6C2A1",
  "network": "base-sepolia",
  "name": "My Wallet",
  "assignedTo": "user123",
  "createdAt": "2021-12-31T00:00:00.000Z"
}
```

### Batch Transaction Result
```json
{
  "message": "Batch transaction processing initiated.",
  "summary": {
    "totalRecipients": 2,
    "submittedSuccessfully": 2,
    "confirmedOnChain": 2
  },
  "details": [
    {
      "recipient": "0x123...",
      "submissionStatus": "fulfilled",
      "txHash": "0xabc...",
      "confirmationStatus": "confirmed"
    }
  ]
}
```

## 🔒 Security Features

- **Input Validation**: Address validation using Viem
- **Rate Limiting**: Built-in retry mechanism with exponential backoff
- **Error Handling**: Comprehensive error handling for all operations
- **Sanitization**: Input sanitization for CDP SDK compatibility

## 🧪 Development

### Available Scripts

- `npm run dev`: Start development server with auto-reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm test`: Run tests (not implemented)

### Adding New Endpoints

1. Add your route handler in `server.ts`
2. Update the API documentation in this README
3. Test your endpoint with proper error handling

## 📖 Additional Resources

- [Coinbase Developer Platform Documentation](https://docs.cdp.coinbase.com/)
- [Viem Documentation](https://viem.sh/)
- [x402 Payment Protocol](https://github.com/x402-protocol)
- [Express.js Documentation](https://expressjs.com/)

## 🔒 Security Notes

- Never commit your `.env` file or expose private keys
- The service uses Base Sepolia testnet by default
- Review and rotate API keys regularly
- Implement proper access controls for production deployments

## 📄 License

This project is licensed under the ISC License.

---

**Disclaimer**: This project is for demonstration purposes. For production use, additional security measures, monitoring, and testing should be implemented.

---

Built with ❤️ using [Coinbase Developer Platform](https://docs.cdp.coinbase.com/) and [Viem](https://viem.sh/).
