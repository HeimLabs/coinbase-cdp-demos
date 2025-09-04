import { CdpClient } from "@coinbase/cdp-sdk";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionConfirmationStrategy,
} from "@solana/web3.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize the CDP Client
const cdp = new CdpClient();

// Initialize a connection to the Solana Devnet
const connection = new Connection("https://api.devnet.solana.com");

console.log("CDP Client and Solana Connection Initialized.");

/**
 * Utility function to pause execution.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Provisions a new Solana account managed by CDP or retrieves an existing one.
 */
async function provisionAccount(name: string): Promise<any> {
    console.log(`[Provisioner] Getting or creating account named '${name}'...`);
    
    const account = await cdp.solana.getOrCreateAccount({ name });
    console.log(`[Provisioner] Account ready: ${account.address}`);
    return account;
}

/**
 * Requests SOL from the CDP faucet if the account balance is zero and waits for it to arrive.
 */
async function fundAccountIfNeeded(account: any): Promise<void> {
    let balance = await connection.getBalance(new PublicKey(account.address));
    console.log(`[Funder] Account ${account.address} balance: ${balance / LAMPORTS_PER_SOL} SOL.`);
  
    if (balance === 0) {
      console.log("[Funder] Account has no SOL. Requesting from CDP Faucet...");
      try {
        const faucetResp = await cdp.solana.requestFaucet({
          address: account.address,
          token: "sol",
        });
        console.log(`[Funder] Faucet request successful. Tx: ${faucetResp.signature}`);
        console.log("[Funder] Waiting for funds to arrive...");
  
        let attempts = 0;
        const maxAttempts = 30; // Wait for up to 30 seconds
        while (balance === 0 && attempts < maxAttempts) {
          await sleep(1000);
          balance = await connection.getBalance(new PublicKey(account.address));
          attempts++;
          process.stdout.write(".");
        }
        console.log(""); // Newline after dots
  
        if (balance === 0) {
          throw new Error("Account not funded after 30 seconds.");
        }
        console.log(`[Funder] 🟢 Funds arrived! New balance: ${balance / LAMPORTS_PER_SOL} SOL.`);
      } catch (error: any) {
        // Handle faucet rate-limiting
        if (error.response?.data?.message?.includes("faucet for this address has already been used")) {
          console.warn("[Funder] 🟡 Faucet already used for this address. Assuming it's funded.");
        } else {
          throw error;
        }
      }
    }
}

/**
 * Waits for a transaction to be confirmed on the blockchain.
 */
async function waitForConfirmation(signature: string) {
    console.log(`[Confirm] Waiting for transaction ${signature} to be confirmed...`);
    const latestBlockhash = await connection.getLatestBlockhash();
    const strategy: TransactionConfirmationStrategy = {
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    };
    const confirmation = await connection.confirmTransaction(strategy);
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
    }
    console.log(`[Confirm] ✅ Transaction confirmed successfully!`);
}

/**
 * Sends a standard SOL transfer and waits for confirmation.
 */
async function sendStandardTransfer(agentAccount: any, recipient: PublicKey, amountLamports: number) {
    console.log(`\n--- 🚀 Initiating Standard Transfer ---`);
    console.log(`Preparing to send ${amountLamports / LAMPORTS_PER_SOL} SOL to ${recipient.toBase58()}`);
  
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(agentAccount.address),
        toPubkey: recipient,
        lamports: amountLamports,
      })
    );
  
    try {
      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(agentAccount.address);
  
      // Serialize transaction
      const serializedTx = Buffer.from(
        transaction.serialize({ requireAllSignatures: false })
      ).toString("base64");
  
      // Use CDP's sendTransaction method
      const txResult = await cdp.solana.sendTransaction({
        network: "solana-devnet",
        transaction: serializedTx,
      });
  
      const transactionId = txResult.transactionSignature;
      console.log(`[Send] Standard Transfer Sent! Transaction ID: ${transactionId}`);
      console.log(`   Explorer Link: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
      
      await waitForConfirmation(transactionId);
    } catch (error) {
      console.error("Error during standard transfer:", error);
    }
}

/**
 * Sends a batched transaction to multiple recipients and waits for confirmation.
 */
async function sendBatchedPayout(agentAccount: any, payouts: { to: PublicKey; amount: number }[]) {
    console.log(`\n--- 🚀 Initiating Batched Payout ---`);
    console.log(`Preparing to send payouts to ${payouts.length} recipients.`);
  
    const payoutInstructions = payouts.map(payout =>
      SystemProgram.transfer({
        fromPubkey: new PublicKey(agentAccount.address),
        toPubkey: payout.to,
        lamports: payout.amount,
      })
    );
  
    const transaction = new Transaction().add(...payoutInstructions);
  
    try {
      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(agentAccount.address);
  
      // Serialize transaction
      const serializedTx = Buffer.from(
        transaction.serialize({ requireAllSignatures: false })
      ).toString("base64");
  
      // Sign transaction
      const { signedTransaction: txSignature } = await cdp.solana.signTransaction({
        address: agentAccount.address,
        transaction: serializedTx,
      });
      const decodedSignedTx = Buffer.from(txSignature, "base64");
  
      console.log("Sending batched transaction...");
      const transactionId = await connection.sendRawTransaction(decodedSignedTx);
  
      console.log(`[Send] Batched Payout Sent! Transaction ID: ${transactionId}`);
      console.log(`   Explorer Link: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
  
      await waitForConfirmation(transactionId);
    } catch (error) {
      console.error("Error during batched payout:", error);
    }
}

/**
 * Sponsors a transaction for a source account, making it "gasless" for the source.
 */
async function sponsorUserTransaction(sponsorAccount: any, sourceAccount: any, recipient: PublicKey) {
    console.log(`\n--- 🚀 Initiating Sponsored Transaction ---`);
    console.log(`Sponsor: ${sponsorAccount.address}`);
    console.log(`Source (User): ${sourceAccount.address}`);
  
    const userActionInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(sourceAccount.address),
      toPubkey: recipient,
      lamports: 1000, // A tiny amount for the demo
    });
  
    const transaction = new Transaction().add(userActionInstruction);
  
    try {
      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(sponsorAccount.address);
  
      // Serialize transaction
      const serializedTx = Buffer.from(
        transaction.serialize({ requireAllSignatures: false })
      ).toString("base64");
  
      // 1. Source account signs to authorize the transfer
      const signedTxResponse = await cdp.solana.signTransaction({
        address: sourceAccount.address,
        transaction: serializedTx,
      });
  
      // 2. Sponsor account signs as fee payer
      const finalSignedTxResponse = await cdp.solana.signTransaction({
        address: sponsorAccount.address,
        transaction: signedTxResponse.signedTransaction,
      });
  
      // 3. Send the fully signed transaction
      console.log("Sending sponsored transaction...");
      const transactionId = await connection.sendRawTransaction(
        Buffer.from(finalSignedTxResponse.signedTransaction, 'base64')
      );
  
      console.log(`[Send] Sponsored Transaction Sent! Transaction ID: ${transactionId}`);
      console.log(`   Explorer Link: https://explorer.solana.com/tx/${transactionId}?cluster=devnet`);
  
      await waitForConfirmation(transactionId);
    } catch (error) {
      console.error("Error during sponsored transaction:", error);
    }
}

/**
 * Signs an off-chain message to prove ownership of an account.
 */
async function signOffChainMessage(agentAccount: any) {
    console.log(`\n--- ✍️ Initiating Off-Chain Message Signing ---`);
    const message = `I am the owner of ${agentAccount.address} at ${new Date().toISOString()}`;
  
    try {
      const { signature } = await agentAccount.signMessage({ message });
      console.log(`✅ Message Signed Successfully!`);
      console.log(`   Message: "${message}"`);
      console.log(`   Signature: ${signature}`);
    } catch (error) {
      console.error("Error signing message:", error);
    }
}

async function main() {
    console.log("--- Starting Solana Agent Demo ---");
  
    // Provision our main agent account and a "user" account for the sponsorship demo
    const agentAccount = await provisionAccount("MySolanaAgent-v2");
    const userAccount = await provisionAccount("DemoUserAccount-v2");
  
    // Ensure accounts have funds before proceeding
    await fundAccountIfNeeded(agentAccount);
    await fundAccountIfNeeded(userAccount);
  
    // --- DEMO SCENARIOS ---
    
    // Define some recipient addresses for the demos
    const recipient1 = new PublicKey("3KzDtddx4i53FBkvCzuDmRbaMozTZoJBb1TToWhz3JfE");
    const recipient2 = new PublicKey("ANVUJaJoVaJZELtV2AvRp7V5qPV1B84o29zAwDhPj1c2");
  
    // 1. Standard Transfer from Agent
    await sendStandardTransfer(agentAccount, recipient1, 0.0001 * LAMPORTS_PER_SOL);
  
    // 2. Batched Payout from Agent
    const payouts = [
      { to: recipient1, amount: 0.00005 * LAMPORTS_PER_SOL },
      { to: recipient2, amount: 0.00005 * LAMPORTS_PER_SOL },
    ];
    await sendBatchedPayout(agentAccount, payouts);
  
    // 3. Sponsored Transaction (Agent sponsors User)
    await sponsorUserTransaction(agentAccount, userAccount, recipient2);
  
    // 4. Off-Chain Message Signing by Agent
    await signOffChainMessage(agentAccount);
  
    console.log("\n--- ✅ Agent Demo Completed ---");
  }
  
  main().catch(error => {
    console.error("\nA critical error occurred in the agent's main execution:", error);
    process.exit(1);
  });