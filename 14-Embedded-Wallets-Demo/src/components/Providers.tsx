"use client";

import { CDPReactProvider } from "@coinbase/cdp-react/components/CDPReactProvider";

import { theme } from "@/components/theme";

interface ProvidersProps {
  children: React.ReactNode;
}

const CDP_CONFIG = {
  projectId: process.env.NEXT_PUBLIC_CDP_PROJECT_ID ?? "",
};

const APP_CONFIG = {
  name: "CDP Next.js StarterKit",
  logoUrl: "http://localhost:3000/logo.svg",
};

/**
 * Providers component that wraps the application in all requisite providers
 *
 * @param props - { object } - The props for the Providers component
 * @param props.children - { React.ReactNode } - The children to wrap
 * @returns The wrapped children
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <CDPReactProvider config={CDP_CONFIG} app={APP_CONFIG} theme={theme}>
      {children}
    </CDPReactProvider>
  );
}
