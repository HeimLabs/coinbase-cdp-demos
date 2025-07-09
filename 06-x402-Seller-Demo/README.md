# x402 Seller Demo

A demonstration of how to monetize API endpoints using the x402 payment protocol. This project shows how to create a payment-protected API service that requires micro-payments for access to premium endpoints.

## 🌟 Features

- **x402 Payment Integration**: Monetize API endpoints with micro-payments
- **Payment-Protected Routes**: Secure API endpoints behind payment walls
- **USDC Payments**: Accept payments in USDC on Base Sepolia testnet
- **Express.js Server**: Simple REST API server
- **TypeScript**: Full TypeScript implementation
- **Flexible Payment Configuration**: Support for different payment amounts and tokens

## 🛠️ Tech Stack

- **Node.js**: JavaScript runtime environment
- **TypeScript**: Type-safe JavaScript superset
- **Express.js**: Web application framework
- **x402-express**: Payment middleware for API monetization
- **x402-axios**: Client library for making x402 payments
- **Coinbase CDP SDK**: For blockchain interactions

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- Base Sepolia testnet USDC tokens
- x402 facilitator service access

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
cd 06-x402-Seller-Demo

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and add your configuration:

```env
# Server Configuration
SERVER_PORT=3001

# Base Sepolia address where payments will be sent
SERVER_PAY_TO_ADDRESS=your_payment_address_here

# URL of the x402 facilitator service
X402_FACILITATOR_URL=https://x402.org/facilitator

# Optional: Add if you need CDP SDK functionality
PRIVATE_KEY=your_private_key_here
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
```

The server will start on `http://localhost:3001` (or your specified port).

## 📚 API Endpoints

### Payment-Protected Endpoints

#### Weather Update (Protected)
```bash
GET /api/weather-update
# Requires: $0.01 USDC payment on base-sepolia
# Returns: Weather information for California
```

**Example Response:**
```json
{
  "report": {
    "location": "California",
    "weather": "clear skies, gentle breeze",
    "temperature": "28°C"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 💰 Payment Configuration

The x402 payment middleware is configured in `src/x402Server.ts`:

```typescript
app.use(
  paymentMiddleware(
    payToAddress, // Where payments are sent
    {
      "GET /api/weather-update": {
        price: "$0.01", // 0.01 USDC
        network: "base-sepolia"
      }
    },
    {
      url: facilitatorUrl // x402 facilitator service
    }
  )
);
```

### Adding New Protected Endpoints

To add a new payment-protected endpoint:

1. Add the route configuration to the payment middleware:
```typescript
"GET /api/your-endpoint": {
  price: "$0.05", // Set your price
  network: "base-sepolia"
}
```

2. Add the route handler:
```typescript
app.get("/api/your-endpoint", (req, res) => {
  // Your endpoint logic here
  res.json({ data: "Your protected data" });
});
```

### Advanced Payment Configuration

For custom tokens or more complex payment structures:

```typescript
"GET /api/premium-service": {
  price: {
    amount: "10000000000000000", // 0.01 of an 18-decimal token
    asset: {
      address: "0x...", // Token contract address
      decimals: 18,
      eip712: {
        name: "WETH",
        version: "1"
      }
    }
  },
  network: "base-sepolia"
}
```

## 🔧 How It Works

1. **Client Request**: A client makes a request to a protected endpoint
2. **Payment Check**: The x402 middleware checks for payment
3. **Payment Processing**: If no payment is found, the client is prompted to pay
4. **Access Granted**: After successful payment, the endpoint returns data
5. **Payment Received**: USDC is sent to the configured address

## 🏗️ Project Structure

```
src/
└── x402Server.ts    # Main server with payment middleware
```

## 🧪 Testing the Service

### Using curl with x402 Headers

```bash
# First request (will show payment required)
curl -X GET http://localhost:3001/api/weather-update

# After payment (with proper x402 headers)
curl -X GET http://localhost:3001/api/weather-update \
  -H "x402-payment: <payment_proof>"
```

### Using x402-axios Client

```javascript
import axios from 'x402-axios';

const client = axios.create({
  baseURL: 'http://localhost:3001',
  // x402 configuration
});

const response = await client.get('/api/weather-update');
console.log(response.data);
```

## 🔒 Security Features

- **Payment Verification**: All payments are cryptographically verified
- **Network-Specific**: Payments are tied to specific blockchain networks
- **Address Validation**: Payment addresses are validated
- **Facilitator Service**: Uses trusted x402 facilitator for payment coordination

## 📊 Use Cases

- **API Monetization**: Charge for access to premium API endpoints
- **Content Paywall**: Require payment for premium content access
- **Micro-Services**: Enable pay-per-use service architecture
- **Data Feeds**: Monetize real-time data feeds
- **AI/ML Services**: Charge for AI model inference calls

## 🛠️ Development

### Available Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start the production server
- `npm run client`: Run the client (if implemented)

### Adding New Features

1. Add new payment-protected routes in the middleware configuration
2. Implement the corresponding Express route handlers
3. Test with proper payment flow
4. Update documentation

## 📖 Additional Resources

- [x402 Protocol Documentation](https://x402.org/docs)
- [x402-express GitHub](https://github.com/x402-protocol/x402-express)
- [x402-axios GitHub](https://github.com/x402-protocol/x402-axios)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)

## 🔒 Security Notes

- Never commit your `.env` file or expose private keys
- Use testnet for development and testing
- Validate all payment proofs properly
- Implement rate limiting for production use
- Monitor payment flows and address balances

## 🚀 Deployment

For production deployment:

1. Use environment variables for all sensitive configuration
2. Implement proper logging and monitoring
3. Set up SSL/TLS certificates
4. Configure proper rate limiting
5. Set up payment address monitoring

## 📄 License

This project is licensed under the ISC License.

---

**Disclaimer**: This project is for demonstration purposes. For production use, additional security measures, monitoring, and testing should be implemented.

---

Built with ❤️ using the [x402 Protocol](https://x402.org/) for decentralized payments.
