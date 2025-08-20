import { AgentKit, CdpEvmWalletProvider, walletActionProvider } from "@coinbase/agentkit";
import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config();

async function main() {
  // ================================================
  // THE MAGIC: Initialize CDP AgentKit
  // ================================================
  const walletProvider = await CdpEvmWalletProvider.configureWithWallet({
    apiKeyId: process.env.CDP_API_KEY_ID,
    apiKeySecret: process.env.CDP_API_KEY_SECRET,
    walletSecret: process.env.CDP_WALLET_SECRET,
    networkId: process.env.NETWORK_ID || "base-sepolia",
  });

  const agentkit = await AgentKit.from({
    walletProvider,
    actionProviders: [walletActionProvider()],
  });

  const tools = await getLangChainTools(agentkit);
  const memory = new MemorySaver();

  // ================================================
  // Create AI agent with blockchain superpowers
  // ================================================
  const agent = createReactAgent({
    llm: new ChatOpenAI({ model: "gpt-4o-mini" }),
    tools,
    checkpointSaver: memory,
    messageModifier: "You are an AI agent that can interact onchain using CDP AgentKit.",
  });

  const config = { configurable: { thread_id: "CDP-Agent" } };

  // ================================================
  // Chat with your blockchain AI agent
  // ================================================
  console.log("🤖 Blockchain AI ready! Try: 'Check my wallet balance'");
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.on("line", async (input) => {
    const stream = await agent.stream(
      { messages: [new HumanMessage(input)] },
      config
    );

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        console.log(chunk.agent.messages[0].content);
      }
    }
  });
}

main().catch(console.error);