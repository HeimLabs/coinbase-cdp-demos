import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenAmount(amount: string | number, decimals = 6): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (num === 0) return "0";
  if (num < 0.000001) return "< 0.000001";
  return num.toFixed(decimals);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export const NETWORKS = {
  baseSepolia: {
    id: 84532,
    name: "Base Sepolia",
    blockExplorer: "https://sepolia.basescan.org",
    faucet: "https://portal.cdp.coinbase.com/products/faucet",
  },
  base: {
    id: 8453,
    name: "Base",
    blockExplorer: "https://basescan.org",
  },
} as const;

export type NetworkKey = keyof typeof NETWORKS;
