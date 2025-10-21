// app/components/AppLayout.tsx
'use client';

import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { ReactNode } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { context } = useMiniKit();
  
  const style = {
    paddingTop: `${context?.client?.safeAreaInsets?.top ?? 0}px`,
    paddingBottom: `${context?.client?.safeAreaInsets?.bottom ?? 0}px`,
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
  };
  
  return (
    <main style={style} className="bg-gradient-to-b from-slate-900 to-slate-800">
      {children}
    </main>
  );
}