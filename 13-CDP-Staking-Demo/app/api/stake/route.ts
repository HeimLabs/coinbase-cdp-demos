// app/api/stake/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Coinbase, ExternalAddress, StakeOptionsMode } from '@coinbase/coinbase-sdk';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, amount } = await request.json();

    // Configure Coinbase SDK with your API key
    const apiKeyPath = path.join(process.cwd(), 'cdp_api_key.json');
    Coinbase.configureFromJson({ filePath: apiKeyPath });

    // Create an external address on the Ethereum Hoodi testnet
    const address = new ExternalAddress(
      Coinbase.networks.EthereumHoodi,
      walletAddress
    );

    // Check stakeable balance
    const stakeableBalance = await address.stakeableBalance(
      Coinbase.assets.Eth,
      StakeOptionsMode.PARTIAL
    );

    // Build the stake operation
    const stakingOperation = await address.buildStakeOperation(
      parseFloat(amount),
      Coinbase.assets.Eth,
      StakeOptionsMode.PARTIAL
    );

    // Get the unsigned transaction
    const unsignedTx = stakingOperation.getTransactions()[0].getUnsignedPayload();

    return NextResponse.json({
      success: true,
      operationId: stakingOperation.getID(),
      stakeableBalance: stakeableBalance.toString(),
      unsignedTransaction: unsignedTx,
      transactions: stakingOperation.getTransactions().map(tx => ({
        unsignedPayload: tx.getUnsignedPayload(),
        status: tx.getStatus()
      }))
    });
  } catch (error: any) {
    console.error('Staking error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create stake operation' },
      { status: 500 }
    );
  }
}