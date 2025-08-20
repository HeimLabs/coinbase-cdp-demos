'use client';

import { baseSepolia } from 'wagmi/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import type { ReactNode } from 'react';

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
    apiKey={process.env.NEXT_PUBLIC_CDP_API_KEY}
    chain={baseSepolia}
    config={{
      paymaster: process.env.NEXT_PUBLIC_CDP_PAYMASTER_URL,
      wallet: {
        preference: 'smartWalletOnly',
      }
    }}
  >
      {props.children}
    </OnchainKitProvider>
  );
}

