# x402 Pinata Client Demo

A demonstration client for using Pinata's x402 service to upload files to IPFS with automatic payment processing. This project shows how to integrate with Pinata's payment-gated IPFS pinning service using the x402 protocol.

## 🌟 Features

- **x402 Payment Integration**: Automatic payment processing for IPFS uploads
- **Pinata IPFS Integration**: Upload files to IPFS through Pinata's service
- **CDP Wallet Integration**: Use Coinbase Developer Platform wallets for payments
- **Pre-signed URL Upload**: Secure file upload flow with pre-signed URLs
- **TypeScript**: Full TypeScript implementation for type safety
- **Payment Tracking**: Track payment transactions and view on block explorer

## 🛠️ Tech Stack

- **Node.js**: JavaScript runtime environment
- **TypeScript**: Type-safe JavaScript superset
- **Coinbase CDP SDK**: For wallet management and payments
- **x402-axios**: Client library for x402 payment protocol
- **Viem**: Ethereum account management
- **Pinata**: IPFS pinning service
- **Axios**: HTTP client for API requests

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- Coinbase Developer Platform (CDP) API credentials
- Base network testnet tokens for payments
- Access to Pinata's x402 service

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
cd 07-x402-Pinata-Client-Demo

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
PINATA_X402_PIN_PUBLIC_PATH=/v1/pin/public
```

### 3. Build and Run

```bash
# Build the TypeScript code
npm run build

# Run the demo
npm start
```

## 🔧 How It Works

The demo follows this workflow:

1. **Initialize CDP Client**: Create a CDP client and wallet account
2. **Setup Payment Interceptor**: Configure x402-axios with payment capabilities
3. **Create File Content**: Generate a demo file with unique UUID
4. **Request Pre-signed URL**: Make payment-gated request to Pinata
5. **Upload to IPFS**: Upload file using the pre-signed URL
6. **Get IPFS CID**: Receive Content Identifier for the uploaded file

### Payment Flow

```
Client Request → x402 Payment Check → Payment Processing → API Access → IPFS Upload
```

## 📊 Example Output

When you run the demo, you'll see output like:

```
🚀 Initializing Pinata x402 Client...
📍 Base URL: https://402.pinata.cloud
📍 Pin Path: /v1/pin/public
💳 Wallet address: 0x123...abc

📄 File details:
   - Content: Hello from x402! UUID: 12345678-1234-1234-1234-123456789012
   - Size: 45 bytes

📤 Requesting pre-signed URL from Pinata...
✅ Pre-signed URL obtained!
💰 Payment info: { transaction: "0xabc...def" }
🔗 Transaction: https://basescan.org/tx/0xabc...def

📁 Uploading file to Pinata...
✅ File upload completed!

🎉 SUCCESS! File pinned to IPFS
📌 IPFS CID: QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
🌐 View on Pinata Gateway: https://gateway.pinata.cloud/ipfs/QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
🌐 View on IPFS.io: https://ipfs.io/ipfs/QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## 🏗️ Code Structure

### Main Components

1. **CDP Client Initialization**
   ```typescript
   const cdpClient = new CdpClient();
   const serverAccount = await cdpClient.evm.getOrCreateAccount({
     name: "MyCDPMainnetPinataPayer1",
   });
   ```

2. **Payment Interceptor Setup**
   ```typescript
   const x402Api = withPaymentInterceptor(
     axios.create({ baseURL: pinataBaseURL }),
     account
   );
   ```

3. **File Upload Process**
   ```typescript
   const presignedResponse = await x402Api.post(pinataPinPath, {
     fileSize: fileBuffer.length
   });
   ```

## 🔒 Security Features

- **Secure Wallet Management**: Uses CDP SDK for secure key management
- **Payment Verification**: All payments are cryptographically verified
- **Pre-signed URLs**: Secure file upload without exposing credentials
- **Environment Variables**: All sensitive data stored in environment variables

## 📚 API Integration

### Pinata x402 Endpoints

- **Base URL**: `https://402.pinata.cloud`
- **Pin Endpoint**: `/v1/pin/public`
- **Payment Required**: USDC on Base network
- **Response**: Pre-signed URL for file upload

### Payment Process

1. Client makes request to protected endpoint
2. x402 middleware checks for payment
3. If payment required, client wallet processes payment
4. Payment verification completes
5. API returns pre-signed URL
6. File upload proceeds to IPFS

## 🧪 Development

### Available Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Run the demo application
- `npm test`: Run tests (not implemented)

### Customization

To upload your own files, modify the file content generation:

```typescript
// Replace this section in src/x402-pinata.ts
const fileContent = `Your custom content here`;
const fileBuffer = Buffer.from(fileContent);
```

For file uploads from disk:

```typescript
import fs from 'fs';

const fileBuffer = fs.readFileSync('path/to/your/file.txt');
```

## 🔧 Configuration

### Environment Variables

- `CDP_API_KEY_ID`: Your CDP API key identifier
- `CDP_API_KEY_SECRET`: Your CDP API key secret
- `CDP_WALLET_SECRET`: Your CDP wallet secret for encryption
- `PINATA_X402_BASE_URL`: Pinata's x402 service base URL
- `PINATA_X402_PIN_PUBLIC_PATH`: API endpoint path for pinning

### Wallet Configuration

The demo creates a wallet account named `MyCDPMainnetPinataPayer1`. You can customize this name in the code.

## 📖 Use Cases

- **Decentralized File Storage**: Store files on IPFS with payment
- **Content Monetization**: Charge for file uploads and storage
- **Proof of Payment**: Demonstrate payment-gated IPFS services
- **Web3 Integration**: Integrate IPFS storage into dApps

## 🚀 Production Considerations

For production use, consider:

1. **Error Handling**: Implement comprehensive error handling
2. **Rate Limiting**: Handle API rate limits appropriately
3. **File Validation**: Validate file types and sizes
4. **Payment Monitoring**: Monitor payment success/failure rates
5. **Backup Strategy**: Consider multiple IPFS pinning services

## 🛠️ Troubleshooting

### Common Issues

1. **Payment Failures**: Ensure wallet has sufficient balance
2. **API Errors**: Check Pinata service status
3. **File Upload Errors**: Verify file size and format
4. **Network Issues**: Ensure stable internet connection

### Debug Tips

- Check console logs for detailed error messages
- Verify environment variables are set correctly
- Test with smaller files first
- Monitor payment transactions on block explorer

## 📖 Additional Resources

- [Pinata Documentation](https://docs.pinata.cloud/)
- [x402 Protocol Documentation](https://x402.org)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- [Viem Documentation](https://viem.sh/)

## 🔒 Security Notes

- Never commit your `.env` file or expose private keys
- Use testnet for development and testing
- Monitor payment transactions and wallet balances
- Implement proper access controls for production use
- Regularly rotate API keys and secrets

## 📄 License

This project is licensed under the ISC License.

---

**Disclaimer**: This project is for demonstration purposes. For production use, additional security measures, monitoring, and testing should be implemented.

---

Built with ❤️ using [Pinata](https://pinata.cloud/), [x402 Protocol](https://x402.org/), and [Coinbase Developer Platform](https://docs.cdp.coinbase.com/).
