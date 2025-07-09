import { CdpClient } from "@coinbase/cdp-sdk";
import axios from "axios";
import { config } from "dotenv";
import { toAccount } from "viem/accounts";
import { decodeXPaymentResponse, withPaymentInterceptor } from "x402-axios";
import FormData from "form-data";

config();

// Environment variables
const apiKeyId = process.env.CDP_API_KEY_ID as string;
const apiKeySecret = process.env.CDP_API_KEY_SECRET as string;
const walletSecret = process.env.CDP_WALLET_SECRET as string;
const pinataBaseURL = process.env.PINATA_X402_BASE_URL as string; // https://x402.pinata.cloud
const pinataPinPath = process.env.PINATA_X402_PIN_PUBLIC_PATH as string; // /v1/pin/public

if (!apiKeyId || !apiKeySecret || !walletSecret || !pinataBaseURL || !pinataPinPath) {
  console.error("Missing required environment variables");
  process.exit(1);
}

async function main() {
  console.log("🚀 Initializing Pinata x402 Client...");
  console.log(`📍 Base URL: ${pinataBaseURL}`);
  console.log(`📍 Pin Path: ${pinataPinPath}`);

  // Step 1: Initialize CDP client and wallet
  const cdpClient = new CdpClient();

  const serverAccount = await cdpClient.evm.getOrCreateAccount({
    name: "MyCDPMainnetPinataPayer1",
  });

  // IMPORTANT: Convert CDP account to viem account format
  const account = toAccount(serverAccount);
  
  console.log(`💳 Wallet address: ${account.address}`);

   // Step 2: Create axios instance with payment interceptor
   const x402Api = withPaymentInterceptor(
    axios.create({
      baseURL: pinataBaseURL,
    }),
    account
  );

    // Step 3: Prepare file content
    const uuid = crypto.randomUUID();
    const fileContent = `Hello from x402! UUID: ${uuid}`;
    const fileBuffer = Buffer.from(fileContent);
    
    console.log(`\n📄 File details:`);
    console.log(`   - Content: ${fileContent}`);
    console.log(`   - Size: ${fileBuffer.length} bytes`);

    try {
      // Step 4: Request pre-signed URL from Pinata
      console.log("\n📤 Requesting pre-signed URL from Pinata...");
      
      const presignedResponse = await x402Api.post(
        pinataPinPath,
        {
          fileSize: fileBuffer.length
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      console.log("✅ Pre-signed URL obtained!");
      console.log("📊 Response data:", JSON.stringify(presignedResponse.data, null, 2));
      
      // Check for payment info
      const xPaymentHeader = presignedResponse.headers["x-payment-response"];
      if (xPaymentHeader) {
        try {
          const paymentInfo = decodeXPaymentResponse(xPaymentHeader);
          console.log("💰 Payment info:", paymentInfo);
          if (paymentInfo.transaction) {
            console.log(`🔗 Transaction: https://basescan.org/tx/${paymentInfo.transaction}`);
          }
        } catch (decodeError) {
         // do nothing
        }
      }

      // Step 5: Upload file to pre-signed URL
    const presignedUrl = presignedResponse.data.url;
    
    if (!presignedUrl) {
      throw new Error("No presigned URL in response!");
    }
    
    console.log("\n📎 Pre-signed URL:", presignedUrl);
    console.log("📁 Uploading file to Pinata...");

    // Create form data
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: "demo.txt",
      contentType: "text/plain",
    });

    // Upload file
    const uploadResponse = await axios.post(presignedUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    console.log("✅ File upload completed!");
    console.log("📊 Upload response data:", JSON.stringify(uploadResponse.data, null, 2));

    // Check for IPFS hash in response
    const cid = uploadResponse.data?.data?.cid || uploadResponse.data?.IpfsHash || uploadResponse.data?.cid;
    
    if (cid) {
      console.log(`\n🎉 SUCCESS! File pinned to IPFS`);
      console.log(`📌 IPFS CID: ${cid}`);
      console.log(`🌐 View on Pinata Gateway: https://gateway.pinata.cloud/ipfs/${cid}`);
      console.log(`🌐 View on IPFS.io: https://ipfs.io/ipfs/${cid}`);
    }

  } catch (error: any) {
    console.error("\n❌ Error occurred:");
    console.error("Error message:", error.message);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    throw error;
  }
}

// Run the demo
main().catch((error) => {
  console.error("\n💥 Unhandled error:", error.message);
  process.exit(1);
});



