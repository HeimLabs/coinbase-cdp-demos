import dotenv from 'dotenv';
import express from 'express';
import { paymentMiddleware } from 'x402-express';

// Load environment variables from .env file
dotenv.config();

const port = parseInt(process.env.SERVER_PORT || "3001");
const payToAddress = process.env.SERVER_PAY_TO_ADDRESS as `0x${string}`;
const facilitatorUrl = process.env.X402_FACILITATOR_URL as string;

if (!payToAddress || !facilitatorUrl) {
  console.error(
    'Missing required environment variables: SERVER_PAY_TO_ADDRESS, X402_FACILITATOR_URL',
  );
  process.exit(1);
}

const app = express();

// Configure the x402 payment middleware
app.use(
    paymentMiddleware(
      payToAddress, // Default address where payments should be sent
      {
        // Route 1: Simple USDC payment for weather data
        "GET /api/weather-update": {
          price: "$0.01", // Requesting 0.01 USDC
          network: "base-sepolia", // Specify the network
        },
    // Route 2: Example for a premium feature using any EIP-3009 compatible token
      /*
      "GET /api/premium-gourmet-recipe": {
        price: {
          amount: "10000000000000000", // e.g., 0.01 of an 18-decimal token (10^16)
          asset: {
            address: "0x", // Contract address
            decimals: 18,
             eip712: {
               name: "WETH",
               version: "1",
            },
          },
        },
        network: "base-sepolia",
      },
      */
      },
      {
        url: facilitatorUrl as `${string}://${string}`, // The URL of the x402 facilitator service
      },
    ),
);

// Handler for the weather update endpoint
app.get("/api/weather-update", (req, res) => {
    console.log(`[Server] Access granted for /api/weather-update`);
    res.send({
      report: {
        location: "California",
        weather: "clear skies, gentle breeze",
        temperature: "28°C",
      },
      timestamp: new Date().toISOString(),
    });
  });
  
  // Handler for the (example) premium recipe endpoint
  /*
  app.get("/api/premium-gourmet-recipe", (req, res) => {
    console.log(`[Server] Access granted for /api/premium-gourmet-recipe`);
    res.send({
      recipeName: "Secret Quantum Quiche",
      ingredients: ["Unobtainium Eggs", "Flux Capacitor Flour", "..."],
      timestamp: new Date().toISOString(),
    });
  });
  */

app.listen(port, () => {
    console.log(`x402 Protected Server listening on http://localhost:${port}`);
    console.log(` - GET /api/weather-update: requires $0.01 USDC on base-sepolia, paid to ${payToAddress}`);
    console.log(`Using facilitator: ${facilitatorUrl}`);
});