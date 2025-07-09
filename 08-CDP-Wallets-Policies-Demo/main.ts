import { CdpClient } from "@coinbase/cdp-sdk";
import { parseEther, createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import dotenv from "dotenv";
dotenv.config();


// Set up clients
const cdp = new CdpClient();
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

async function manageAccountPolicy() {
  // 1. Get or create an account
  const account = await cdp.evm.getOrCreateAccount({
    name: "AccountForSpecificPolicy1"
  });
  console.log("Using account:", account.address);

  // 2. Define and create an account-level policy
  const safeAddress = "0xB207F0CE9D53DBFC5C7c2f36A8b00b3315464529"; // Example safe address
  const policyDefinition = {
    policy: {
      scope: "account" as const,
      description: `Account level policy`,
      rules: [
        {
          action: "accept" as const,
          operation: "signEvmTransaction" as const,
          criteria: [
            {
              type: "ethValue" as const,
              ethValue: "10000000000000", // 0.00001 ETH in wei
              operator: "<=" as const,
            },
            {
              type: "evmAddress" as const,
              addresses: [safeAddress] as `0x${string}`[],
              operator: "in" as const,
            },
          ],
        },
      ],
    },
  };

  const newPolicy = await cdp.policies.createPolicy(policyDefinition);
  console.log("Created account-level policy:", newPolicy.id);

  // 3. Apply the policy to the account
  const updatedAccount = await cdp.evm.updateAccount({
    address: account.address,
    update: {
      accountPolicy: newPolicy.id
    }
  });
  console.log(`Applied policy ${newPolicy.id} to account: ${updatedAccount.address}`);
  console.log("Updated account policies:", updatedAccount.policies);

  // 4. Fund the account from faucet
  console.log("\nFunding account from faucet...");
  const faucetResp = await cdp.evm.requestFaucet({
    address: account.address,
    network: "base-sepolia",
    token: "eth",
  });
  await publicClient.waitForTransactionReceipt({
    hash: faucetResp.transactionHash,
  });
  console.log("Account funded!");

  // 5. Test the policy by sending a transaction
  console.log("\nTesting policy with transaction (0.000001 ETH to safe address)...");
  try {
    const { transactionHash } = await cdp.evm.sendTransaction({
      address: account.address,
      network: "base-sepolia",
      transaction: {
        to: safeAddress,
        value: parseEther("0.0000001"), // Small amount that passes policy
      },
    });
    
    await publicClient.waitForTransactionReceipt({ hash: transactionHash });
    console.log(`✅ Transaction confirmed! Explorer: https://sepolia.basescan.org/tx/${transactionHash}`);
  } catch (error) {
    console.error("❌ Transaction failed:", error);
  }


  // 6. Test policy violation 
  console.log("\nTesting policy violation (0.002 ETH - exceeds limit)...");
  try {
    await cdp.evm.sendTransaction({
      address: account.address,
      network: "base-sepolia",
      transaction: {
        to: safeAddress,
        value: parseEther("0.0015"), // Exceeds 0.001 ETH limit
      },
    });
  } catch (error) {
    console.log("✅ Policy correctly blocked transaction!");
  }
}

manageAccountPolicy().catch(console.error);