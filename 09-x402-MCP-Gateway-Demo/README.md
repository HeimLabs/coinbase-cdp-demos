# x402 MCP Gateway Demo

A comprehensive demonstration of the x402 payment protocol that combines both service provider and client functionality through an MCP (Model Context Protocol) server. This project shows how to create payment-gated APIs and consume them using x402 payments, all integrated with AI/LLM tools.

## 🌟 Features

- **Dual x402 Architecture**: Both payment service provider and client in one project
- **MCP Server Integration**: Tools available for AI/LLM consumption
- **Express API Gateway**: Local x402-protected weather API
- **Pinata IPFS Integration**: Upload files to IPFS with x402 payments
- **Multi-Network Support**: Base Sepolia testnet and Base mainnet
- **CDP Wallet Integration**: Automated payment processing with CDP wallets
- **Real-time Weather API**: Mock weather service with payment protection
- **TypeScript**: Full TypeScript implementation for type safety

## 🛠️ Tech Stack

- **Node.js**: JavaScript runtime environment
- **TypeScript**: Type-safe JavaScript superset
- **Express.js**: Web application framework for API gateway
- **MCP SDK**: Model Context Protocol server implementation
- **x402-express**: Payment middleware for service provider
- **x402-axios**: Payment client for consuming services
- **Coinbase CDP SDK**: Wallet management and payment processing
- **Pinata**: IPFS pinning service integration
- **Viem**: Ethereum account management
- **Zod**: Runtime type validation

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- Coinbase Developer Platform (CDP) API credentials
- Base Sepolia testnet USDC tokens (for weather API)
- Base mainnet USDC tokens (for Pinata IPFS)
- MCP-compatible client (like Claude Desktop or compatible LLM)

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
cd 09-x402-MCP-Gateway-Demo

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
# Coinbase Developer Platform API Keys
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret
CDP_WALLET_SECRET=your_cdp_wallet_secret

# Pinata x402 API Configuration
PINATA_X402_BASE_URL=https://402.pinata.cloud
PINATA_PIN_PATH=/v1/pin/public
```

### 3. Run the Server

```bash
# Start the MCP server (includes Express API gateway)
npm start
```

The server will start both:
- Express API gateway on `http://localhost:4021`
- MCP server listening on stdio for LLM connections

## 🔧 Architecture Overview

This project demonstrates a complete x402 ecosystem:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   LLM Client    │    │   MCP Server    │    │  Express API    │
│   (Claude)      │◄──►│   (x402 Client) │◄──►│   (x402 Server) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  External APIs  │
                       │  (Pinata IPFS)  │
                       └─────────────────┘
```

### Components

1. **Express API Gateway**: Local x402-protected weather API
2. **MCP Server**: Provides tools for LLM consumption
3. **x402 Client**: Makes payments to access external services
4. **CDP Wallet**: Handles payment processing

## 📚 Available Tools

### 1. Weather API Tool (`getWeather`)

Get current weather information for any city with x402 payment protection.

**Parameters:**
- `city` (string): The city name to get weather for
- `units` (enum): Temperature units - "metric" (Celsius) or "imperial" (Fahrenheit)

**Payment:**
- Cost: $0.001 USDC
- Network: Base Sepolia testnet
- Service: Local Express server

**Example Usage:**
```javascript
// Through MCP client
{
  "tool": "getWeather",
  "arguments": {
    "city": "San Francisco",
    "units": "metric"
  }
}
```

### 2. Pinata IPFS Tool (`pinTextToIpfs`)

Upload text content to IPFS via Pinata's x402 service.

**Parameters:**
- `textContent` (string): The text content to be pinned to IPFS
- `fileName` (string): The desired file name, e.g., "my-note.txt"

**Payment:**
- Cost: Variable (based on file size)
- Network: Base mainnet
- Service: Pinata IPFS

**Example Usage:**
```javascript
// Through MCP client
{
  "tool": "pinTextToIpfs",
  "arguments": {
    "textContent": "Hello, decentralized world!",
    "fileName": "greeting.txt"
  }
}
```

## 🔧 Configuration

### Express API Gateway

The local weather API is configured with x402 payment middleware:

```typescript
app.use(
  paymentMiddleware(
    "0xB207F0CE9D53DBFC5C7c2f36A8b00b3315464529", // Payment address
    {
      "GET /weather": {
        price: "$0.001",
        network: "base-sepolia"
      }
    },
    {
      url: "https://x402.org/facilitator"
    }
  )
);
```

### MCP Server Tools

Both tools are implemented with proper Zod validation:

```typescript
server.tool(
  "getWeather",
  "Get current weather for a city using x402 micropayments",
  {
    city: z.string().describe("The city name to get weather for"),
    units: z.enum(["metric", "imperial"]).default("metric")
  },
  async (args) => {
    // Tool implementation
  }
);
```

## 📊 Example Outputs

### Weather Tool Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "Weather in San Francisco:\nTemperature: 22°C\nConditions: Sunny\nHumidity: 65%\nWind Speed: 12 km/h\n\n💰 Paid $0.001 via x402 on Base Sepolia\n🕐 2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### Pinata IPFS Tool Response
```json
{
  "content": [
    {
      "type": "text",
      "text": "Successfully pinned to IPFS as 'greeting.txt'.\n\nCID: QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX\nView: https://gateway.pinata.cloud/ipfs/QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
    }
  ]
}
```

## 🔄 Payment Flows

### Local Weather API Flow
1. LLM requests weather data through MCP
2. MCP server calls local Express API
3. Express API requires x402 payment
4. CDP wallet processes payment on Base Sepolia
5. Weather data is returned to LLM

### Pinata IPFS Flow
1. LLM requests file upload through MCP
2. MCP server calls Pinata x402 API
3. Pinata requires payment for pre-signed URL
4. CDP wallet processes payment on Base mainnet
5. File is uploaded to IPFS
6. IPFS CID is returned to LLM

## 🛠️ Development

### Available Scripts

- `npm start`: Start both Express and MCP servers
- `npm run build`: Build TypeScript (if build script exists)

### Adding New Tools

To add a new MCP tool:

1. Define the tool schema with Zod validation
2. Implement the tool handler
3. Add payment logic if needed
4. Test with MCP client

Example:
```typescript
server.tool(
  "myNewTool",
  "Description of the new tool",
  {
    param1: z.string().describe("Parameter description"),
    param2: z.number().optional().describe("Optional parameter")
  },
  async (args) => {
    // Tool implementation
    return {
      content: [
        {
          type: "text",
          text: "Tool response"
        }
      ]
    };
  }
);
```

### Testing Tools

Test tools individually:

```bash
# Test weather API directly
curl -X GET "http://localhost:4021/weather?city=London&units=metric"

# Test through MCP (requires MCP client)
# Use Claude Desktop or compatible LLM client
```

## 🔒 Security Features

- **Payment Verification**: All payments are cryptographically verified
- **Network Separation**: Testnet for development, mainnet for production services
- **Input Validation**: Zod schema validation for all tool parameters
- **Environment Variables**: Secure credential management
- **Error Handling**: Comprehensive error handling for payment failures

## 📖 Use Cases

- **AI-Powered APIs**: Create payment-gated APIs for AI/LLM consumption
- **Micro-service Architecture**: Build pay-per-use service ecosystems
- **Content Monetization**: Charge for AI-generated content storage
- **Data Access Control**: Implement payment barriers for premium data
- **Decentralized Storage**: Integrate IPFS uploads with payment protection

## 🚀 Production Considerations

For production deployment:

1. **Security**: Implement proper authentication and authorization
2. **Monitoring**: Add logging and monitoring for payment flows
3. **Scaling**: Consider load balancing for high-traffic scenarios
4. **Error Recovery**: Implement retry logic and failure handling
5. **Cost Management**: Monitor and optimize payment costs

## 🛠️ MCP Client Integration

### Claude Desktop Integration

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "x402-gateway": {
      "command": "node",
      "args": ["/path/to/09-x402-MCP-Gateway-Demo/src/mcp-server.ts"],
      "env": {
        "CDP_API_KEY_ID": "your_key_id",
        "CDP_API_KEY_SECRET": "your_key_secret",
        "CDP_WALLET_SECRET": "your_wallet_secret"
      }
    }
  }
}
```

### Custom MCP Client

```typescript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({
  name: "x402-gateway-client",
  version: "1.0.0"
});

const transport = new StdioClientTransport({
  command: "npm",
  args: ["start"],
  cwd: "/path/to/09-x402-MCP-Gateway-Demo"
});

await client.connect(transport);
```

## 🔧 Troubleshooting

### Common Issues

1. **Payment Failures**: Ensure wallet has sufficient balance on correct network
2. **Server Startup**: Check port 4021 is available
3. **MCP Connection**: Verify MCP client configuration
4. **API Errors**: Check network connectivity and API endpoints

### Debug Tips

- Check console logs for detailed error messages
- Monitor payment transactions on block explorer
- Test APIs individually before MCP integration
- Verify environment variables are properly set

## 📖 Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [x402 Protocol Documentation](https://x402.org/docs)
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/mcp)

## 🔒 Security Notes

- Never commit your `.env` file or expose private keys
- Use separate wallets for testnet and mainnet
- Monitor payment transactions and wallet balances
- Implement proper rate limiting in production
- Regularly rotate API keys and secrets

## 📄 License

This project is licensed under the ISC License.

---

**Disclaimer**: This project is for demonstration purposes. For production use, additional security measures, monitoring, and testing should be implemented.

---

Built with ❤️ using [Model Context Protocol](https://modelcontextprotocol.io/), [x402 Protocol](https://x402.org/), and [Coinbase Developer Platform](https://docs.cdp.coinbase.com/).
