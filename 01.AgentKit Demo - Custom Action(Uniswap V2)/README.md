# AgentKit CLI Chatbot with Uniswap V2 Custom Action

A command-line interface (CLI) chatbot powered by Coinbase's AgentKit that demonstrates how to implement custom blockchain actions. This project showcases a custom Uniswap V2 action provider for swapping ETH to USDC on the Base Sepolia testnet.

## 🌟 Features

- **CLI Interface**: Interactive command-line interface with both chat and autonomous modes
- **Custom Uniswap V2 Action**: Implementation of a custom action provider for ETH to USDC swaps
- **CDP Wallet Integration**: Secure wallet management using Coinbase Developer Platform
- **Persistent Wallet Storage**: Wallet data is saved locally between sessions
- **GPT-4o Integration**: Leverages OpenAI's GPT-4o-mini for intelligent conversations
- **Multiple Operation Modes**: Choose between interactive chat or autonomous operation

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn package manager
- Coinbase Developer Platform (CDP) API key
- OpenAI API key

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/HeimLabs/coinbase-cdp-demos
cd "01.AgentKit Demo - Custom Action(Uniswap V2)"

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
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# CDP API Key Name
CDP_API_KEY_NAME=your_cdp_api_key_name_here

# CDP API Key Private Key
CDP_API_KEY_PRIVATE_KEY=your_cdp_api_key_private_key_here
```

### 3. Start the Chatbot

```bash
# Run in development mode (with auto-reload)
npm run dev

# Or run in production mode
npm start
```

## 🤖 Using the Chatbot

After starting the application, you'll be prompted to choose between two modes:

### Chat Mode

In chat mode, you can have an interactive conversation with the agent. The agent can:

- Provide information about your wallet
- Execute ETH to USDC swaps on Uniswap V2
- Respond to general queries about cryptocurrency and DeFi

Example prompts:

- "What's my wallet address?"
- "Swap 0.01 ETH to USDC"
- "Tell me about Uniswap V2"

### Autonomous Mode

In autonomous mode, the agent will perform a series of predefined actions at regular intervals. This mode is useful for demonstrating the agent's capabilities without user interaction.

## 🔧 Technical Details

### Custom Uniswap V2 Action Provider

The core feature of this project is the custom action provider for Uniswap V2 operations:

```typescript
class UniswapV2ActionProvider extends ActionProvider<CdpWalletProvider> {
  @CreateAction({
    name: "swap-eth-to-usdc",
    description: "Swap ETH for USDC using Uniswap V2 on base-sepolia",
    schema: UniswapSwapSchema,
  })
  async swapEthToUsdc(
    walletProvider: CdpWalletProvider,
    args: z.infer<typeof UniswapSwapSchema>,
  ): Promise<string> {
    // Implementation...
  }
}
```

The provider implements a `swap-eth-to-usdc` action that:

- Uses the Uniswap V2 Router at address `0x1689E7B1F10000AE47eBfE339a4f69dECd19F602`
- Supports swapping ETH to USDC on Base Sepolia testnet
- Handles transaction execution and error management

### Architecture

The project consists of a single TypeScript file (`chatbot.ts`) that includes:

1. **Custom Action Provider**: Implementation of the Uniswap V2 action provider
2. **Agent Initialization**: Setup of the LLM, wallet provider, and agent
3. **CLI Interface**: Interactive command-line interface with mode selection
4. **Wallet Management**: CDP wallet integration with persistence

### Key Components

1. **AgentKit Integration**: Uses AgentKit to enable blockchain interactions through a conversational interface.

2. **LangChain + GPT-4o**: Leverages LangChain's ReAct agent pattern with OpenAI's GPT-4o-mini model.

3. **Wallet Provider**: Uses CDP's MPC wallet for secure transaction signing and execution.

4. **Custom Action Provider**: Implements the Uniswap V2 integration for token swaps.

## 🛠️ Development

### Project Structure

- `chatbot.ts`: Main application file containing all logic
- `.env.example`: Template for environment variables
- `wallet_data.txt`: Persisted wallet data (generated on first run)

### Adding New Custom Actions

To extend the agent with additional capabilities:

1. Define a new schema using Zod for the action parameters
2. Create a method in the action provider class with the `@CreateAction` decorator
3. Implement the action logic using the CDP wallet provider

Example:

```typescript
// Define schema
const MyActionSchema = z.object({
  param1: z.string().describe("Description of param1"),
  param2: z.number().describe("Description of param2"),
});

// Add action to provider
@CreateAction({
  name: "my-custom-action",
  description: "Description of my custom action",
  schema: MyActionSchema,
})
async myCustomAction(
  walletProvider: CdpWalletProvider,
  args: z.infer<typeof MyActionSchema>,
): Promise<string> {
  // Implementation here
}
```

## 📚 Additional Resources

- [AgentKit Documentation](https://docs.cdp.coinbase.com/agentkit/docs/welcome)
- [Coinbase Developer Platform](https://docs.cdp.coinbase.com/)
- [Uniswap V2 Documentation](https://docs.uniswap.org/contracts/v2/overview)
- [LangChain Documentation](https://js.langchain.com/)

## 🔒 Security Notes

- Never commit your `.env` file or expose API keys
- The project uses testnet by default; be cautious if deploying to mainnet
- Review the CDP API key permissions for production deployments

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Submit a pull request

## 📄 License

This project is licensed under the terms specified in the package.json file.

---

**Disclaimer**: This project is for demonstration purposes. Use at your own risk when deploying to production environments or mainnet networks.

---

Built with ❤️ using [AgentKit](https://github.com/coinbase/agentkit) by Coinbase.