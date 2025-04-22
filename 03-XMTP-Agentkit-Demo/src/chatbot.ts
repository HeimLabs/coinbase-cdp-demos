// Environment and file system
import * as dotenv from "dotenv";
import * as fs from "fs";

// Coinbase AgentKit for blockchain interactions
import {
  AgentKit,
  CdpWalletProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
} from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";

// LangChain for AI functionality
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";

// XMTP for messaging
import {
  Client,
  IdentifierKind,
  Signer,
  type DecodedMessage,
  type XmtpEnv,
} from "@xmtp/node-sdk";
import { fromString } from "uint8arrays/from-string";

// Viem for blockchain wallet functionality
import { createWalletClient, http, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// Initialize environment variables
dotenv.config();

// Storage constants
const STORAGE_DIR = ".data/wallets";

// Global stores for memory and agent instances
const memoryStore: Record<string, MemorySaver> = {};
const agentStore: Record<string, Agent> = {};

// Type definitions
interface AgentConfig {
  configurable: {
    thread_id: string;
  };
}

type Agent = ReturnType<typeof createReactAgent>;

/**
 * Ensure local storage directory exists
 */
function ensureLocalStorage() {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  }
  
  /**
   * Save wallet data to storage
   */
  async function saveWalletData(userId: string, walletData: string) {
    const localFilePath = `${STORAGE_DIR}/${userId}.json`;
    try {
      fs.writeFileSync(localFilePath, walletData);
    } catch (error) {
      console.error(`Failed to save wallet data to file: ${error}`);
    }
  }
  
  /**
   * Get wallet data from storage
   */
  async function getWalletData(userId: string): Promise<string | null> {
    const localFilePath = `${STORAGE_DIR}/${userId}.json`;
    try {
      if (fs.existsSync(localFilePath)) {
        return fs.readFileSync(localFilePath, "utf8");
      }
    } catch (error) {
      console.warn(`Could not read wallet data from file: ${error}`);
    }
    return null;
  }

  /**
 * Create a signer from a wallet private key
 */
const createSigner = (walletKey: string): Signer => {
    // Create a wallet account from the private key
    const account = privateKeyToAccount(walletKey as `0x${string}`);
    
    // Create a wallet client for signing messages
    const wallet = createWalletClient({
      account,
      chain: sepolia,
      transport: http(),
    });
  
    // Return the XMTP signer interface
    return {
      type: "EOA" as const,
      getIdentifier: () => ({
        identifierKind: IdentifierKind.Ethereum,
        identifier: account.address.toLowerCase(),
      }),
      signMessage: async (message: string) => {
        const signature = await wallet.signMessage({
          message,
          account,
        });
        return toBytes(signature);
      },
    };
  };
  
  /**
   * Convert hex encryption key to XMTP format
   */
  function getEncryptionKeyFromHex(key: string): Uint8Array {
    const hexString = key.startsWith("0x") ? key.slice(2) : key;
    return fromString(hexString, "hex");
  }

  /**
 * Initialize the XMTP client
 */
async function initializeXmtpClient() {
    const { WALLET_KEY, ENCRYPTION_KEY, XMTP_ENV } = process.env;
  
    // Check that all required environment variables are set
    if (!WALLET_KEY || !ENCRYPTION_KEY || !XMTP_ENV) {
      throw new Error("Some environment variables are not set. Please check your .env file.");
    }
  
    // Create the signer and encryption key
    const signer = createSigner(WALLET_KEY);
    const encryptionKey = getEncryptionKeyFromHex(ENCRYPTION_KEY);
    const env: XmtpEnv = XMTP_ENV as XmtpEnv;
  
    // Initialize the XMTP client
    const client = await Client.create(signer, encryptionKey, { env });
  
    // Sync existing conversations
    await client.conversations.sync();
  
    // Get the agent's address and display connection information
    const identifier = await signer.getIdentifier();
    const address = identifier.identifier;
  
    console.log(
      `Agent initialized on ${env} network\nSend a message on http://xmtp.chat/dm/${address}?env=${env}`,
    );
  
    return client;
  }

  /**
 * Initialize the agent for a specific user
 */
async function initializeAgent(userId: string): Promise<{ agent: Agent; config: AgentConfig }> {
    try {
      // Check if an agent already exists for this user
      if (agentStore[userId]) {
        console.log(`Using existing agent for user: ${userId}`);
        const agentConfig = {
          configurable: { thread_id: userId },
        };
        return { agent: agentStore[userId], config: agentConfig };
      }
  
      // Create a new OpenAI language model instance
      const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
      });
  
      // Get any stored wallet data for this user
      const storedWalletData = await getWalletData(userId);
      console.log(
        `Creating new agent for user: ${userId}, wallet data: ${storedWalletData ? "Found" : "Not found"}`,
      );
  
      // Configure the CDP wallet provider with our credentials
      const config = {
        apiKeyName: process.env.CDP_API_KEY_NAME,
        apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        cdpWalletData: storedWalletData || undefined,
        networkId: process.env.NETWORK_ID || "base-sepolia",
      };
  
      // Initialize the wallet provider
      const walletProvider = await CdpWalletProvider.configureWithWallet(config);
      
      // Initialize AgentKit with necessary providers
      const agentkit = await AgentKit.from({
        walletProvider,
        actionProviders: [
          walletActionProvider(),        // Basic wallet operations (view address, etc)
          erc20ActionProvider(),         // ERC-20 token operations (send, check balance)
          cdpApiActionProvider({         // Coinbase Developer Platform API operations
            apiKeyName: process.env.CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
          cdpWalletActionProvider({      // Coinbase Developer Platform wallet operations
            apiKeyName: process.env.CDP_API_KEY_NAME,
            apiKeyPrivateKey: process.env.CDP_API_KEY_PRIVATE_KEY?.replace(/\\n/g, "\n"),
          }),
        ],
      });
  
      // Convert AgentKit tools to LangChain format
      const tools = await getLangChainTools(agentkit);
  
      // Create a memory store for this user if it doesn't exist
      if (!memoryStore[userId]) {
        console.log(`Creating new memory store for user: ${userId}`);
        memoryStore[userId] = new MemorySaver();
      }
  
      // Configure the agent
      const agentConfig: AgentConfig = {
        configurable: { thread_id: userId },
      };


   // Create the agent with LangChain
    const agent = createReactAgent({
        llm,
        tools,
        checkpointSaver: memoryStore[userId],
        messageModifier: `
          You are a DeFi Payment Agent that assists users with sending payments and managing their crypto assets.
          You can interact with the blockchain using Coinbase Developer Platform AgentKit.
  
          When a user asks you to make a payment or check their balance:
          1. Always check the wallet details first to see what network you're on
          2. If on base-sepolia testnet, you can request funds from the faucet if needed
          3. For mainnet operations, provide wallet details and request funds from the user
  
          Your default network is Base Sepolia testnet.
          Your main and only token for transactions is USDC. Token address is 0x036CbD53842c5426634e7929541eC2318f3dCF7e. USDC is gasless on Base.
  
          You can only perform payment and wallet-related tasks. For other requests, politely explain that you're 
          specialized in processing payments and can't assist with other tasks.
                  
          If you encounter an error:
          - For 5XX errors: Ask the user to try again later
          - For other errors: Provide clear troubleshooting advice and offer to retry
          
          Be concise, helpful, and security-focused in all your interactions.
        `,
      });
  
      // Store the agent for future use
      agentStore[userId] = agent;
  
      // Export and save the wallet data
      const exportedWallet = await walletProvider.exportWallet();
      const walletDataJson = JSON.stringify(exportedWallet);
      await saveWalletData(userId, walletDataJson);
      console.log(`Wallet data saved for user ${userId}`);
  
      return { agent, config: agentConfig };
    } catch (error) {
      console.error("Failed to initialize agent:", error);
      throw error;
    }
  }

  /**
 * Process a message with the agent
 */
async function processMessage(agent: Agent, config: AgentConfig, message: string): Promise<string> {
    let response = "";
  
    try {
      // Stream the message through the agent
      const stream = await agent.stream({ messages: [new HumanMessage(message)] }, config);
  
      // Collect the response chunks
      for await (const chunk of stream) {
        if ("agent" in chunk) {
          response += chunk.agent.messages[0].content + "\n";
        }
      }
  
      return response.trim();
    } catch (error) {
      console.error("Error processing message:", error);
      return "Sorry, I encountered an error while processing your request. Please try again later.";
    }
  }

  /**
 * Handle incoming XMTP messages
 */
async function handleMessage(message: DecodedMessage, client: Client) {
    try {
      const senderAddress = message.senderInboxId;
      const botAddress = client.inboxId.toLowerCase();
  
      // Ignore messages from the bot itself
      if (senderAddress.toLowerCase() === botAddress) {
        return;
      }
  
      console.log(`Received message from ${senderAddress}: ${message.content}`);
  
      // Initialize or get the agent for this user
      const { agent, config } = await initializeAgent(senderAddress);
      
      // Process the message and get a response
      const response = await processMessage(agent, config, message.content);
  
      // Get the conversation and send the response
      const conversation = await client.conversations.getConversationById(message.conversationId);
      if (!conversation) {
        throw new Error(`Could not find conversation for ID: ${message.conversationId}`);
      }
      
      await conversation.send(response);
      console.log(`Sent response to ${senderAddress}: ${response}`);
    } catch (error) {
      console.error("Error handling message:", error);
      
      // Send an error message back to the user
      try {
        const conversation = await client.conversations.getConversationById(message.conversationId);
        if (conversation) {
          await conversation.send(
            "I encountered an error while processing your request. Please try again later."
          );
        }
      } catch (e) {
        console.error("Failed to send error message:", e);
      }
    }
  }

  /**
 * Start listening for XMTP messages
 */
async function startMessageListener(client: Client) {
    console.log("Starting message listener...");
    
    // Create a stream of all messages
    const stream = await client.conversations.streamAllMessages();
    
    // Process each message as it arrives
    for await (const message of stream) {
      if (message) {
        await handleMessage(message, client);
      }
    }
  }
  
  /**
 * Validates that required environment variables are set
 */
function validateEnvironment(): void {
    const missingVars: string[] = [];
  
    const requiredVars = [
      "OPENAI_API_KEY",
      "CDP_API_KEY_NAME",
      "CDP_API_KEY_PRIVATE_KEY",
      "WALLET_KEY",
      "ENCRYPTION_KEY",
    ];
  
    // Check each required variable
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
  
    // Warn if network ID is not set
    if (!process.env.NETWORK_ID) {
      console.warn("Warning: NETWORK_ID not set, defaulting to base-sepolia");
    }
  }
  
  /**
 * Main function to start the chatbot
 */
async function main(): Promise<void> {
    console.log("Initializing Agent on XMTP...");
  
    // Validate environment and ensure storage directory exists
    validateEnvironment();
    ensureLocalStorage();
  
    // Initialize XMTP client and start listening for messages
    const xmtpClient = await initializeXmtpClient();
    await startMessageListener(xmtpClient);
  }
  
  // Start the chatbot
  main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
  
