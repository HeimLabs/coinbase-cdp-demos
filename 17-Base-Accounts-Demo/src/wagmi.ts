import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { baseAccount } from '@wagmi/connectors';

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    baseAccount({
      appName: 'Base Accounts Demo',
      appLogoUrl: 'https://base.org/logo.png',
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
  // Enable server-side rendering
  ssr: true,
});

export function getConfig() {
  return config
}
