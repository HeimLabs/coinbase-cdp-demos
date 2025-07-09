import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CdpClient } from "@coinbase/cdp-sdk";
import axios from "axios";
import { withPaymentInterceptor } from "x402-axios";
import FormData from "form-data";
import dotenv from "dotenv";
import { toAccount } from "viem/accounts";
import express from "express";
import { paymentMiddleware, Network } from "x402-express";
import path from 'path';
import { z } from "zod";

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });


// 1. Initialize environment variables
const {
  CDP_API_KEY_ID,
  CDP_API_KEY_SECRET,
  CDP_WALLET_SECRET,
  PINATA_X402_BASE_URL,
  PINATA_PIN_PATH
} = process.env;

if (
  !CDP_API_KEY_ID ||
  !CDP_API_KEY_SECRET ||
  !CDP_WALLET_SECRET ||
  !PINATA_X402_BASE_URL ||
  !PINATA_PIN_PATH
) {
  throw new Error(
    "All required environment variables must be set in .env file."
  );
}

// Initialize CDP Client
const cdpClient = new CdpClient();

const WALLET_NAME = "MyCDPMainnetPinataPayer1";
const EXPRESS_PORT = 4021;
const WEATHER_API_URL = `http://localhost:${EXPRESS_PORT}`;

let x402Client: ReturnType<typeof axios.create>;

// ===== Part 1: CREATE X402-MONETIZED EXPRESS SERVER =====
const app = express();

// Configure x402 payment middleware for Base Sepolia
app.use(
  paymentMiddleware(
    "0xB207F0CE9D53DBFC5C7c2f36A8b00b3315464529", // Your receiving wallet address
    {
      "GET /weather": {
        price: "$0.001", // Price in USD
        network: "base-sepolia" as Network,
      },
    },
    {
      url: "https://x402.org/facilitator", // Facilitator URL for Base Sepolia testnet
    }
  )
);

// Weather API endpoint - protected by x402 payments
app.get("/weather", (req, res) => {
  const { city = "Unknown", units = "metric" } = req.query;

  // Generate mock weather data
  const temperature = Math.floor(Math.random() * 30) + 10;
  const tempF = Math.floor((temperature * 9) / 5 + 32);

  res.json({
    city: city,
    temperature: units === "imperial" ? tempF : temperature,
    units: units === "imperial" ? "F" : "C",
    conditions: ["Sunny", "Cloudy", "Rainy", "Partly Cloudy"][
      Math.floor(Math.random() * 4)
    ],
    humidity: Math.floor(Math.random() * 40) + 40,
    windSpeed: Math.floor(Math.random() * 20) + 5,
    timestamp: new Date().toISOString(),
    paymentRequired: true,
    cost: "$0.001",
  });
});

// ===== PART 2: CREATE MCP SERVER =====
const server = new McpServer({
  name: "mcp-x402-gateway",
  version: "1.0.0",
});

// Tool 1: Weather API - Uses our local x402-monetized Express server
server.tool(
    "getWeather",
    "Get current weather for a city using x402 micropayments on Base Sepolia testnet",
    {
      city: z.string().describe("The city name to get weather for"),
      units: z.enum(["metric", "imperial"]).default("metric").describe('Temperature units: "metric" (Celsius) or "imperial" (Fahrenheit)'),
    },
    async (args) => {
      try {
        // Parameters are now properly validated by Zod
        const { city, units } = args;
        
        console.error(`[MCP Weather Tool] Requesting weather for ${city} in ${units} units...`);
  
        // Call our x402-protected weather API
        const response = await x402Client.get(`${WEATHER_API_URL}/weather`, {
          params: { city, units },
        });
  
        console.error(
          "[MCP Weather Tool] Payment processed and weather data received!"
        );
  
        const data = response.data;
        return {
          content: [
            {
              type: "text",
              text:
                `Weather in ${data.city}:\n` +
                `Temperature: ${data.temperature}°${data.units}\n` +
                `Conditions: ${data.conditions}\n` +
                `Humidity: ${data.humidity}%\n` +
                `Wind Speed: ${data.windSpeed} ${
                  units === "metric" ? "km/h" : "mph"
                }\n\n` +
                `💰 Paid ${data.cost} via x402 on Base Sepolia\n` +
                `🕐 ${data.timestamp}`,
            },
          ],
        };
      } catch (error: any) {
        console.error(
          "[MCP Weather Tool] Error:",
          error.response?.data || error.message
        );
        return {
          content: [
            {
              type: "text",
              text: `Failed to fetch weather data. Error: ${
                error.response?.data?.message || error.message
              }\n\nMake sure the Express server is running and your wallet has testnet USDC.`,
            },
          ],
        };
      }
    }
  );

// Tool 2: Pinata IPFS Tool
server.tool(
    'pinTextToIpfs',
    'Takes text content, converts it to a file, and uploads it to IPFS via Pinata using x402 payments on mainnet',
    {
      textContent: z.string().describe('The text content to be pinned to IPFS.'),
      fileName: z.string().describe('The desired file name for the content, e.g., "my-note.txt".'),
    },
    async (args) => {
        try {
          // Parameters are now properly validated by Zod
          const { textContent, fileName } = args;
          
          console.error(`[Pinata Tool] Pinning text content to file: ${fileName}`);
          
          const fileBuffer = Buffer.from(textContent, 'utf-8');
          const fileSize = fileBuffer.length;
    
          console.error('[Pinata Tool] Step 1: Requesting presigned URL from Pinata...');
          
          const presignedUrlResponse = await x402Client.post(PINATA_PIN_PATH, { 
            fileSize: fileSize 
          }, {
            headers: {
              "Content-Type": "application/json",
            }
          });
          
          const presignedUrl = presignedUrlResponse.data.url;
          console.error('[Pinata Tool] Payment handled successfully!');
    
          console.error('[Pinata Tool] Step 2: Uploading file data...');
          const formData = new FormData();
          formData.append('file', fileBuffer, { 
            filename: fileName,
            contentType: 'text/plain'
          });
          
          const uploadResponse = await axios.post(presignedUrl, formData, { 
            headers: {
              ...formData.getHeaders()
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity
          });
    
          const cid = uploadResponse.data?.data?.cid || 
                      uploadResponse.data?.IpfsHash || 
                      uploadResponse.data?.cid;
          
          console.error(`[Pinata Tool] Upload complete! CID: ${cid}`);
    
          return { 
            content: [
              { 
                type: 'text', 
                text: `Successfully pinned to IPFS as '${fileName}'.\n\nCID: ${cid}\nView: https://gateway.pinata.cloud/ipfs/${cid}` 
              }
            ]
          };
    
        } catch (error: any) {
          console.error('[Pinata Tool] Error:', error.response?.data || error.message);
          return { 
            content: [
              { 
                type: 'text', 
                text: `Failed to pin content. Error: ${error.response?.data?.message || error.message}` 
              }
            ]
          };
        }
      }
    );

      
// ===== STEP 3: START BOTH SERVERS =====
async function runServers() {
    // Start Express server first
    app.listen(EXPRESS_PORT, () => {
      console.error(`[Express Server] X402-monetized API running at http://localhost:${EXPRESS_PORT}`);
      console.error(`[Express Server] Network: Base Sepolia (testnet)`);
    });
  
    // Initialize CDP wallet for MCP server
    console.error('\n[MCP Server] Initializing CDP wallet...');
    
    const cdpAccount = await cdpClient.evm.getOrCreateAccount({
      name: WALLET_NAME
    });
    
    console.error(`[MCP Server] Wallet address: ${cdpAccount.address}`);
    console.error(`[MCP Server] Make sure this wallet has USDC on Base Mainnet!`);
    
    // Convert CDP account to viem account
    const viemAccount = toAccount(cdpAccount);
  
    // Initialize x402 client
    x402Client = withPaymentInterceptor(
      axios.create({ baseURL: PINATA_X402_BASE_URL }),
      viemAccount
    );
    
    console.error('[MCP Server] x402 client ready for payments');
  
    // Connect MCP server
    console.error('[MCP Server] Starting MCP server...');
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('[MCP Server] Ready to serve LLM tool calls!');
    console.error('\n✅ Both servers are running. The MCP server can now make x402 payments to both local and external APIs.');
  }
  
  runServers().catch((error) => {
    console.error('Failed to start servers:', error);
    process.exit(1);
  });
    