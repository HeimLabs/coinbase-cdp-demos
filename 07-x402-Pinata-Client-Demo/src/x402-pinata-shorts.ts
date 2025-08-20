import "dotenv/config";
import { CdpClient } from "@coinbase/cdp-sdk";
import { toAccount } from "viem/accounts";
import { withPaymentInterceptor } from "x402-axios";
import axios from "axios";
import FormData from "form-data";

// ================================================
// CLIENT SETUP
// ================================================
const cdpClient = new CdpClient();

// Pinata x402 endpoint details
const PINATA_BASE_URL = "https://402.pinata.cloud";
const PINATA_PIN_PATH = "/v1/pin/public";

async function main() {
  // Get a CDP account
  const serverAccount = await cdpClient.evm.getOrCreateAccount({
    name: "MyCDPPinataPayer",
  });

  // Convert to a viem-compatible account
  const account = toAccount(serverAccount);
  console.log(`💳 Using wallet: ${account.address}`);

  // ================================================
  // THE MAGIC: Create a payment-aware API client
  // ================================================
  const x402Api = withPaymentInterceptor(
    axios.create({
      baseURL: PINATA_BASE_URL,
    }),
    account
  );

  // Prepare a file to upload
  const fileContent = `Hello from x402! ${crypto.randomUUID()}`;
  const fileBuffer = Buffer.from(fileContent);

  try {
    // ================================================
    // STEP 1: GET PRE-SIGNED URL (Handles 402 Payment)
    // ================================================
    console.log("\n📤 Requesting pre-signed URL from Pinata...");
    const presignedResponse = await x402Api.post(
      PINATA_PIN_PATH,
      { fileSize: fileBuffer.length },
      { headers: { "Content-Type": "application/json" } }
    );

    const presignedUrl = presignedResponse.data.url;
    if (!presignedUrl) {
      throw new Error("Failed to get a pre-signed URL from Pinata.");
    }

    // ================================================
    // STEP 2: UPLOAD FILE TO PRE-SIGNED URL
    // ================================================
    console.log("📁 Uploading file...");
    const formData = new FormData();
    formData.append("file", fileBuffer, {
      filename: "demo.txt",
      contentType: "text/plain",
    });

    const uploadResponse = await axios.post(presignedUrl, formData, {
      headers: { ...formData.getHeaders() },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    // Extract the IPFS CID from the final upload response
    const cid =
      uploadResponse.data?.data?.cid ||
      uploadResponse.data?.IpfsHash ||
      uploadResponse.data?.cid;

    if (!cid) {
      throw new Error("Could not find IPFS CID in the upload response.");
    }

    console.log(`\n🎉 SUCCESS! File pinned to IPFS`);
    console.log(`📌 IPFS CID: ${cid}`);
    console.log(`🌐 View on Gateway: https://gateway.pinata.cloud/ipfs/${cid}`);
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
  }
}

// Run the script
main().catch(console.error);
