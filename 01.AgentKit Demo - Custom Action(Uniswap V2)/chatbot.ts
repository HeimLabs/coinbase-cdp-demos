import {
  AgentKit,
  CdpWalletProvider,
  cdpApiActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpWalletActionProvider,
  ActionProvider,
  Network,
  CreateAction,
} from "@coinbase/agentkit";
  import { getLangChainTools } from "@coinbase/agentkit-langchain";
  import { HumanMessage } from "@langchain/core/messages";
  import { MemorySaver } from "@langchain/langgraph";
  import { createReactAgent } from "@langchain/langgraph/prebuilt";
  import { ChatOpenAI } from "@langchain/openai";
  import * as dotenv from "dotenv";
  import * as fs from "fs";
  import * as readline from "readline";
  import { z } from "zod";
  
  dotenv.config();
  
  // Uniswap V2 Router ABI (only the function we need)
  const UNISWAP_V2_ROUTER_ABI = [
    {
      inputs: [
        { internalType: "uint256", name: "amountOutMin", type: "uint256" },
        { internalType: "address[]", name: "path", type: "address[]" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "deadline", type: "uint256" },
      ],
      name: "swapExactETHForTokens",
      outputs: [{ internalType: "uint256[]", name: "amounts", type: "uint256[]" }],
      stateMutability: "payable",
      type: "function",
    },
  ];
  
  // Uniswap V2 config for base-sepolia
  const UNISWAP_CONFIG = {
    ROUTER_ADDRESS: "0x1689E7B1F10000AE47eBfE339a4f69dECd19F602",
    FACTORY_ADDRESS: "0x7Ae58f10f7849cA6F5fB71b7f45CB416c9204b1e",
    WETH_ADDRESS: "0x4200000000000000000000000000000000000006", 
    USDC_ADDRESS: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  };
  
  // Define the schema for the Uniswap swap action
  const UniswapSwapSchema = z.object({
    ethAmount: z.number().describe("Amount of ETH to swap"),
    slippagePercent: z.number().default(1).describe("Slippage percentage (default: 1%)"),
  });
  
  /**
   * Create a Uniswap Action Provider
   * This provider enables ETH to USDC swaps on Uniswap V2 on base-sepolia
   */
  class UniswapV2ActionProvider extends ActionProvider<CdpWalletProvider> {
    /**
     * Constructor for the Uniswap V2 Action Provider
     */
    constructor() {
      super("uniswap-v2-provider", []);
    }
  
    /**
     * Swap ETH to USDC using Uniswap V2
     *
     * @param walletProvider - CDP wallet provider
     * @param args - Arguments for the swap
     * @returns A promise that resolves to a transaction result message
     */
    @CreateAction({
      name: "swap-eth-to-usdc",
      description: "Swap ETH for USDC using Uniswap V2 on base-sepolia",
      schema: UniswapSwapSchema,
    })
    async swapEthToUsdc(
      walletProvider: CdpWalletProvider,
      args: z.infer<typeof UniswapSwapSchema>,
    ): Promise<string> {
      try {
        const wallet = walletProvider.getWallet();
        const senderAddress = (await walletProvider.getAddress()) as `0x${string}`;
  
        // Calculate amountOutMin with slippage
        const amountOutMin = 0; // For simplicity, we set to 0
  
        // Set deadline to 20 minutes
        const deadline = Math.floor(Date.now() / 1000) + 20 * 60;
  
        // Define the swap path: ETH -> USDC
        const path = [UNISWAP_CONFIG.WETH_ADDRESS, UNISWAP_CONFIG.USDC_ADDRESS];
  
        // Create contract invocation
        const contractInvocation = await wallet.invokeContract({
          contractAddress: UNISWAP_CONFIG.ROUTER_ADDRESS,
          method: "swapExactETHForTokens",
          args: {
            amountOutMin: amountOutMin.toString(),
            path: path,
            to: senderAddress,
            deadline: deadline.toString(),
          },
          abi: UNISWAP_V2_ROUTER_ABI,
          amount: args.ethAmount, // Amount of ETH to send with the transaction
          assetId: "eth", // Specify ETH as the asset to use for payment
        });
  
        // Wait for the transaction to complete
        await contractInvocation.wait();
  
        // Get the transaction hash
        const txHash = contractInvocation.toString();
  
        return `Successfully swapped ${args.ethAmount} ETH for USDC. Transaction hash: ${txHash}`;
      } catch (error) {
        console.error("Error swapping ETH to USDC:", error);
        if (error instanceof Error) {
          return `Failed to swap ETH to USDC: ${error.message}`;
        }
        return "Failed to swap ETH to USDC due to an unknown error";
      }
    }
  
    /**
     * Checks whether this provider supports the given network
     *
     * @param network - The network to check
     * @returns boolean indicating whether the network is supported
     */
    supportsNetwork = (network: Network) => {
      // Only support base-sepolia network
      return network.networkId === "base-sepolia";
    };
  }
  
  // Create function to instantiate the Uniswap action provider
  const uniswapV2ActionProvider = () => new UniswapV2ActionProvider();
  
  /**
   * Validates that required environment variables are set
   *
   * @throws {Error} - If required environment variables are missing
   * @returns {void}
   */
  function validateEnvironment(): void {
    const missingVars: string[] = [];
  
    // Check required variables
    const requiredVars = ["OPENAI_API_KEY", "CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY"];
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });
  
    // Exit if any required variables are missing
    if (missingVars.length > 0) {
      console.error("Error: Required environment variables are not set");
      missingVars.forEach(varName => {
        console.error(`${varName}=your_${varName.toLowerCase()}_here`);
      });
      process.exit(1);
    }
  
    // Warn about optional NETWORK_ID
    if (!process.env.NETWORK_ID) {
      console.warn("Warning: NETWORK_ID not set, defaulting to base-sepolia testnet");
    }
  }
  
  // Add this right after imports and before any other code
  validateEnvironment();
  
  // Configure a file to persist the agent's CDP MPC Wallet Data
  const WALLET_DATA_FILE = "wallet_data.txt";
  
  /**
   * Initialize the agent with CDP Agentkit
   *
   * @returns Agent executor and config
   */
  async function initializeAgent() {
    try {
      // Initialize LLM
      const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
      });
  
      let walletDataStr: string | null = null;
  
      // Read existing wallet data if available
      if (fs.existsSync(WALLET_DATA_FILE)) {
        try {
          walletDataStr = fs.readFileSync(WALLET_DATA_FILE, "utf8");
        } catch (error) {
          console.error("Error reading wallet data:", error);
          // Continue without wallet data
        }
      }
  
      // Configure CDP Wallet Provider
      const config = {
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
        cdpWalletData: walletDataStr || undefined,
        networkId: process.env.NETWORK_ID || "base-sepolia",
      };
  
      const walletProvider = await CdpWalletProvider.configureWithWallet(config);
  
      // Initialize AgentKit with the new Uniswap action provider
      const agentkit = await AgentKit.from({
        walletProvider,
        actionProviders: [
          walletActionProvider(),
          erc20ActionProvider(),
          cdpApiActionProvider({
            apiKeyName: process.env.CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
          }),
          cdpWalletActionProvider({
            apiKeyName: process.env.CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY,
          }),
          // Add our new Uniswap V2 action provider
          uniswapV2ActionProvider(),
        ],
      });
  
      const tools = await getLangChainTools(agentkit);
  
      // Store buffered conversation history in memory
      const memory = new MemorySaver();
      const agentConfig = { configurable: { thread_id: "CDP AgentKit Chatbot Example!" } };
  
      // Create React Agent using the LLM and CDP AgentKit tools
      const agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memory,
        messageModifier: `
          You are a helpful agent that can interact onchain using the Coinbase Developer Platform AgentKit. You are 
          empowered to interact onchain using your tools. If you ever need funds, you can request them from the 
          faucet if you are on network ID 'base-sepolia'. If not, you can provide your wallet details and request 
          funds from the user. Before executing your first action, get the wallet details to see what network 
          you're on. If there is a 5XX (internal) HTTP error code, ask the user to try again later. If someone 
          asks you to do something you can't do with your currently available tools, you must say so, and 
          encourage them to implement it themselves using the CDP SDK + Agentkit, recommend they go to 
          docs.cdp.coinbase.com for more information. Be concise and helpful with your responses. Refrain from 
          restating your tools' descriptions unless it is explicitly requested.
          
          You can now swap ETH for USDC on Uniswap V2 on the base-sepolia network using the swap-eth-to-usdc tool.
          When a user asks about swapping ETH for USDC, use this new tool.
          `,
      });
  
      // Save wallet data
      const exportedWallet = await walletProvider.exportWallet();
      fs.writeFileSync(WALLET_DATA_FILE, JSON.stringify(exportedWallet));
  
      return { agent, config: agentConfig };
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      throw error; // Re-throw to be handled by caller
    }
  }
  
  /**
   * Run the agent autonomously with specified intervals
   *
   * @param agent - The agent executor
   * @param config - Agent configuration
   * @param interval - Time interval between actions in seconds
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function runAutonomousMode(agent: any, config: any, interval = 10) {
    console.log("Starting autonomous mode...");
  
    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        const thought =
          "Be creative and do something interesting on the blockchain. " +
          "Choose an action or set of actions and execute it that highlights your abilities.";
  
        const stream = await agent.stream({ messages: [new HumanMessage(thought)] }, config);
  
        for await (const chunk of stream) {
          if ("agent" in chunk) {
            console.log(chunk.agent.messages[0].content);
          } else if ("tools" in chunk) {
            console.log(chunk.tools.messages[0].content);
          }
          console.log("-------------------");
        }
  
        await new Promise(resolve => setTimeout(resolve, interval * 1000));
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error:", error.message);
        }
        process.exit(1);
      }
    }
  }
  
  /**
   * Run the agent interactively based on user input
   *
   * @param agent - The agent executor
   * @param config - Agent configuration
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function runChatMode(agent: any, config: any) {
    console.log("Starting chat mode... Type 'exit' to end.");
  
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    const question = (prompt: string): Promise<string> =>
      new Promise(resolve => rl.question(prompt, resolve));
  
    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const userInput = await question("\nPrompt: ");
  
        if (userInput.toLowerCase() === "exit") {
          break;
        }
  
        const stream = await agent.stream({ messages: [new HumanMessage(userInput)] }, config);
  
        for await (const chunk of stream) {
          if ("agent" in chunk) {
            console.log(chunk.agent.messages[0].content);
          } else if ("tools" in chunk) {
            console.log(chunk.tools.messages[0].content);
          }
          console.log("-------------------");
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    } finally {
      rl.close();
    }
  }
  
  /**
   * Choose whether to run in autonomous or chat mode based on user input
   *
   * @returns Selected mode
   */
  async function chooseMode(): Promise<"chat" | "auto"> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    const question = (prompt: string): Promise<string> =>
      new Promise(resolve => rl.question(prompt, resolve));
  
    // eslint-disable-next-line no-constant-condition
    while (true) {
      console.log("\nAvailable modes:");
      console.log("1. chat    - Interactive chat mode");
      console.log("2. auto    - Autonomous action mode");
  
      const choice = (await question("\nChoose a mode (enter number or name): "))
        .toLowerCase()
        .trim();
  
      if (choice === "1" || choice === "chat") {
        rl.close();
        return "chat";
      } else if (choice === "2" || choice === "auto") {
        rl.close();
        return "auto";
      }
      console.log("Invalid choice. Please try again.");
    }
  }
  
  /**
   * Start the chatbot agent
   */
  async function main() {
    try {
      const { agent, config } = await initializeAgent();
      const mode = await chooseMode();
  
      if (mode === "chat") {
        await runChatMode(agent, config);
      } else {
        await runAutonomousMode(agent, config);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
  
  if (require.main === module) {
    console.log("Starting Agent...");
    main().catch(error => {
      console.error("Fatal error:", error);
      process.exit(1);
    });
  }
  