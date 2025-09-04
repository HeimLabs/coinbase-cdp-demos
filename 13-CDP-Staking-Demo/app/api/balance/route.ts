// app/api/balance/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Coinbase, ExternalAddress, StakeOptionsMode } from '@coinbase/coinbase-sdk';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json();

    const apiKeyPath = path.join(process.cwd(), 'cdp_api_key.json');
    Coinbase.configureFromJson({ filePath: apiKeyPath });

    const address = new ExternalAddress(
      Coinbase.networks.EthereumHoodi,
      walletAddress
    );

    const stakeableBalance = await address.stakeableBalance(
      Coinbase.assets.Eth,
      StakeOptionsMode.PARTIAL
    );

    return NextResponse.json({
      success: true,
      walletAddress,
      stakeableBalance: stakeableBalance.toString(),
      network: 'Ethereum Hoodi Testnet'
    });
  } catch (error: any) {
    console.error('Balance check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check balance' },
      { status: 500 }
    );
  }
}