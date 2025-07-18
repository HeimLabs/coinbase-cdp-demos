import 'dotenv/config';
import { CdpClient } from '@coinbase/cdp-sdk';
import {
    parseUnits,
    createPublicClient,
    http,
    erc20Abi,
    encodeFunctionData,
    type Address,
} from 'viem';
import { base } from 'viem/chains';

// ================================================
// CLIENT SETUP
// ================================================
const publicClient = createPublicClient({ chain: base, transport: http() });
const cdp = new CdpClient();

// ================================================
// ADDRESS CONFIG
// ================================================
const TOKENS = {
    WETH: {
        address: "0x4200000000000000000000000000000000000006" as Address,
        symbol: "WETH",
        decimals: 18,
    },
    USDC: {
        address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
        symbol: "USDC",
        decimals: 6,
    },
};
const PERMIT2_ADDRESS: Address = "0x000000000022D473030F116dDEE9F6B43aC78BA3";

async function main() {
    const account = await cdp.evm.getOrCreateAccount({ name: "SwapTutorialAccount" });

    // ================================================
    // SWAP CONFIG
    // ================================================
    const fromToken = TOKENS.WETH;
    const toToken = TOKENS.USDC;
    const swapAmount = "0.00004"; // 0.0004 WETH
    const fromAmount = parseUnits(swapAmount, fromToken.decimals);

    try {
        // ================================================
        // ALLOWANCE
        // ================================================
        console.log(`🔐 Executing token allowance...`);
        const allowanceResult = await account.sendTransaction({
            network: 'base',
            transaction: {
                to: fromToken.address,
                data: encodeFunctionData({
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [PERMIT2_ADDRESS, fromAmount]
                }),
            },
        });
        await publicClient.waitForTransactionReceipt({ hash: allowanceResult.transactionHash });
        console.log(`✅ Approval confirmed`);

        // ================================================
        // SWAP
        // ================================================
        console.log(`🔄 Executing swap...`);
        const result = await account.swap({
            network: 'base',
            fromToken: fromToken.address,
            toToken: toToken.address,
            fromAmount,
            slippageBps: 100, // 1% slippage tolerance
        });
        await publicClient.waitForTransactionReceipt({
            hash: result.transactionHash,
        });
        console.log(`\n🎉 Swap confirmed!`);
        console.log(`🔍 View on Basescan: https://basescan.org/tx/${result.transactionHash}`);

    } catch (error: any) {
        console.error(`❌ Error:`, error.message);
    }
}

// Run the script
main().catch(console.error);