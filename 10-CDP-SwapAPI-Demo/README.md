# CDP Swap API Demo

A comprehensive tutorial demonstrating how to use the Coinbase Developer Platform (CDP) SDK to perform token swaps on the Base network. This project shows both the recommended all-in-one approach and the advanced create-then-execute pattern for token swapping.

## 🌟 Features

- **Token Swapping**: Swap between ERC20 tokens on Base mainnet
- **Dual Approaches**: All-in-one pattern (recommended) and create-then-execute pattern
- **Allowance Management**: Automatic token allowance handling for ERC20 tokens
- **Slippage Protection**: Configurable slippage tolerance for swaps
- **Transaction Monitoring**: Real-time transaction confirmation tracking
- **Comprehensive Examples**: WETH to USDC swap demonstration
- **TypeScript**: Full TypeScript implementation for type safety

## 🛠️ Tech Stack

- **Node.js**: JavaScript runtime environment
- **TypeScript**: Type-safe JavaScript superset
- **Coinbase CDP SDK**: For wallet management and swap operations
- **Viem**: Ethereum interactions and transaction handling
- **Base Network**: Layer 2 network for efficient and low-cost swaps

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- Coinbase Developer Platform (CDP) API credentials
- Base mainnet tokens (WETH for the demo)
- Understanding of ERC20 token mechanics

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos.git
cd 10-CDP-SwapAPI-Demo

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file and add your CDP credentials:

```env
# Coinbase Developer Platform API Keys
CDP_API_KEY_ID=your_cdp_api_key_id
CDP_API_KEY_SECRET=your_cdp_api_key_secret
CDP_WALLET_SECRET=your_cdp_wallet_secret
```

### 3. Prepare Your Wallet

Before running the demo, ensure your wallet has WETH tokens:

```bash
# You'll need WETH tokens on Base mainnet
# You can wrap ETH to WETH or get WETH from a DEX
```

### 4. Build and Run

```bash
# Build the TypeScript code
npm run build

# Run the swap demo
npm start
```

## 🔧 How It Works

The demo demonstrates token swapping with these key steps:

1. **Account Setup**: Create or retrieve a CDP wallet account
2. **Token Allowance**: Check and approve token allowances for Permit2
3. **Swap Execution**: Execute the token swap using one of two approaches
4. **Transaction Monitoring**: Monitor and confirm the swap transaction

### Supported Tokens

The demo uses these Base mainnet tokens:

```typescript
const TOKENS = {
  WETH: {
    address: "0x4200000000000000000000000000000000000006",
    symbol: "WETH",
    decimals: 18
  },
  USDC: {
    address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    symbol: "USDC",
    decimals: 6
  }
};
```

## 📚 Swap Approaches

### Approach 1: All-in-One Pattern (Recommended)

The recommended approach for most use cases:

```typescript
const result = await account.swap({
  network: "base",
  fromToken: fromToken.address,
  toToken: toToken.address,
  fromAmount: parseUnits("0.0004", 18),
  slippageBps: 100, // 1% slippage tolerance
});
```

**Advantages:**
- Single function call
- Automatic quote creation and execution
- Built-in error handling
- Best for 90% of use cases

### Approach 2: Create-then-Execute Pattern (Advanced)

For scenarios requiring more control:

```typescript
// Step 1: Create swap quote
const swapQuote = await account.quoteSwap({
  network: "base",
  fromToken: fromToken.address,
  toToken: toToken.address,
  fromAmount: parseUnits("0.0004", 18),
  slippageBps: 100,
});

// Step 2: Inspect quote details
console.log(`Expected to receive: ${formatUnits(swapQuote.toAmount, 6)} USDC`);

// Step 3: Execute swap
const result = await account.swap({ swapQuote });
```

**Advantages:**
- More control over the swap process
- Ability to inspect quote details before execution
- Better for complex scenarios requiring validation

## 📊 Example Output

When you run the demo, you'll see output like:

```
🚀 CDP SDK Token Swap Tutorial - All-in-One Pattern
📍 Network: base
⚠️  Make sure you have WETH tokens available for swapping!

✅ Using account: 0x123...abc

🔍 Checking WETH allowance to Permit2 contract...
  Current allowance: 0.0004 WETH
✅ Token allowance sufficient: 0.0004 WETH

💱 Planning to swap 0.0004 WETH for USDC

📚 APPROACH 1: All-in-one Pattern (Recommended)
This approach handles everything in a single call.

🔄 Creating and executing swap in one call...

✅ Swap submitted successfully!
📋 Transaction hash: 0xabc...def
⏳ Waiting for confirmation...

🎉 Swap Transaction Confirmed!
📦 Block number: 12345678
⛽ Gas used: 150000
📊 Status: Success ✅
🔍 View on Basescan: https://basescan.org/tx/0xabc...def
```

## 🔧 Configuration

### Environment Variables

- `CDP_API_KEY_ID`: Your CDP API key identifier
- `CDP_API_KEY_SECRET`: Your CDP API key secret
- `CDP_WALLET_SECRET`: Your CDP wallet secret for encryption

### Swap Parameters

You can customize the swap by modifying these parameters:

```typescript
// Token amount (in string format)
const swapAmount = "0.0004"; // 0.0004 WETH

// Slippage tolerance (in basis points)
const slippageBps = 100; // 1% slippage

// Network (currently supports Base mainnet)
const NETWORK = "base";
```

### Adding New Token Pairs

To add support for other tokens:

```typescript
const TOKENS = {
  // Add new tokens here
  DAI: {
    address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    symbol: "DAI",
    decimals: 18,
    isNativeAsset: false
  },
  // ... existing tokens
};
```

## 🔒 Security Features

- **Slippage Protection**: Configurable slippage tolerance prevents unexpected losses
- **Allowance Management**: Secure token allowance handling through Permit2
- **Transaction Verification**: All transactions are verified on-chain
- **Error Handling**: Comprehensive error handling for various failure scenarios

## 🛠️ Advanced Features

### Allowance Management

The demo automatically handles ERC20 token allowances:

```typescript
// Check current allowance
const currentAllowance = await getAllowance(
  ownerAddress, 
  tokenAddress,
  tokenSymbol
);

// Approve tokens if needed
if (currentAllowance < fromAmount) {
  await approveTokenAllowance(
    ownerAddress,
    tokenAddress,
    PERMIT2_ADDRESS,
    fromAmount
  );
}
```

### Transaction Monitoring

Real-time transaction confirmation:

```typescript
const receipt = await publicClient.waitForTransactionReceipt({
  hash: result.transactionHash,
});

console.log(`📦 Block number: ${receipt.blockNumber}`);
console.log(`⛽ Gas used: ${receipt.gasUsed}`);
console.log(`📊 Status: ${receipt.status === 'success' ? 'Success ✅' : 'Failed ❌'}`);
```

## 📖 Use Cases

- **Portfolio Rebalancing**: Automatically rebalance token portfolios
- **Trading Bots**: Implement automated trading strategies
- **DeFi Integration**: Integrate swaps into DeFi applications
- **Cross-Chain Bridging**: Prepare tokens for cross-chain transfers
- **Yield Optimization**: Swap to higher-yield tokens

## 🛠️ Development

### Available Scripts

- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Run the swap demo
- `npm run transfer`: Run token transfer demo (if available)

### Testing Different Scenarios

You can test various scenarios by modifying the code:

```typescript
// Test different amounts
const swapAmount = "0.001"; // Try different amounts

// Test different slippage tolerances
slippageBps: 50, // 0.5% slippage (tighter)
slippageBps: 300, // 3% slippage (looser)

// Test different token pairs
const fromToken = TOKENS.USDC;
const toToken = TOKENS.WETH;
```

### Error Handling

The demo includes comprehensive error handling:

```typescript
try {
  const result = await account.swap({...});
} catch (error) {
  if (error.message?.includes("Insufficient liquidity")) {
    console.log("❌ Swap failed: Insufficient liquidity");
    console.log("💡 Try reducing the swap amount or using a different token pair");
  } else {
    throw error;
  }
}
```

## 🚀 Production Considerations

For production use, consider:

1. **Slippage Management**: Implement dynamic slippage based on market conditions
2. **MEV Protection**: Use MEV-protected RPC endpoints
3. **Rate Limiting**: Implement rate limiting for API calls
4. **Error Recovery**: Implement retry logic for failed transactions
5. **Gas Optimization**: Monitor and optimize gas usage
6. **Multi-DEX Support**: Compare quotes from multiple DEXs

## 🔧 Troubleshooting

### Common Issues

1. **Insufficient Allowance**: Ensure token allowances are properly set
2. **Insufficient Liquidity**: Try smaller amounts or different token pairs
3. **High Slippage**: Increase slippage tolerance or reduce swap amount
4. **Network Issues**: Check Base network status and RPC connectivity

### Debug Tips

- Check token balances before swapping
- Monitor gas prices and network congestion
- Verify token contract addresses
- Test with small amounts first

## 📖 Additional Resources

- [CDP SDK Documentation](https://docs.cdp.coinbase.com/cdp-sdk/docs/welcome)
- [Base Network Documentation](https://docs.base.org/)
- [Viem Documentation](https://viem.sh/)
- [Permit2 Documentation](https://docs.uniswap.org/contracts/permit2/overview)
- [ERC20 Token Standard](https://eips.ethereum.org/EIPS/eip-20)

## 🔒 Security Notes

- Never commit your `.env` file or expose private keys
- Use mainnet only for production swaps
- Always verify transaction details before execution
- Monitor slippage and MEV protection
- Keep API keys secure and rotate regularly

## 📄 License

This project is licensed under the ISC License.

---

**Disclaimer**: This project is for demonstration purposes. For production use, additional security measures, monitoring, and testing should be implemented. Always test thoroughly on testnets before using mainnet.

---

Built with ❤️ using [Coinbase Developer Platform](https://docs.cdp.coinbase.com/) and [Viem](https://viem.sh/).
