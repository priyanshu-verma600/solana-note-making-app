'use client';

import dynamic from 'next/dynamic';
import { WalletContextProvider } from '@/components/walletprovider';

// Dynamically import Dashboard to avoid SSR issues with wallet
const Dashboard = dynamic(() => import('@/components/dashboard'), {
  ssr: false,
});

export default function Home() {
  return (
    <WalletContextProvider>
      <Dashboard />
    </WalletContextProvider>
  );
}