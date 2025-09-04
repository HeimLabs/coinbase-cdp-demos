import { CdpClient } from "@coinbase/cdp-sdk";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function main() {
  const cdp = new CdpClient();
  const connection = new Connection("https://api.devnet.solana.com");
  
  console.log("Starting Solana Bot Demo...");

  // 1. Create Solana account
  const account = await cdp.solana.getOrCreateAccount({ name: "demo-bot" });
  console.log("New account created:", account.address);

  // 2. Fund with SOL
  await cdp.solana.requestFaucet({ address: account.address, token: "sol" });
  console.log("Faucet request successful!");

  // Wait for funds
  let balance = 0;
  while (balance === 0) {
    await new Promise(r => setTimeout(r, 1000));
    balance = await connection.getBalance(new PublicKey(account.address));
  }
  console.log(`Account funded: ${balance / LAMPORTS_PER_SOL} SOL`);

  // 3. Send SOL transaction
  const recipient = new PublicKey("3KzDtddx4i53FBkvCzuDmRbaMozTZoJBb1TToWhz3JfE");
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(account.address),
      toPubkey: recipient,
      lamports: 0.0001 * LAMPORTS_PER_SOL,
    })
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = new PublicKey(account.address);

  const serializedTx = Buffer.from(transaction.serialize({ requireAllSignatures: false })).toString("base64");
  
  const result = await cdp.solana.sendTransaction({
    network: "solana-devnet",
    transaction: serializedTx,
  });

  console.log("Transaction sent:", result.transactionSignature);
  console.log("Explorer:", `https://explorer.solana.com/tx/${result.transactionSignature}?cluster=devnet`);
  console.log("Demo completed!");
}

main().catch(console.error);