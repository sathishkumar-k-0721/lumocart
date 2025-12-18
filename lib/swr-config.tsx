'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false, // Don't refetch when window gets focus
        revalidateOnReconnect: true, // Refetch when internet reconnects
        dedupingInterval: 60000, // Dedupe requests within 60 seconds
        errorRetryCount: 3, // Retry failed requests 3 times
        errorRetryInterval: 5000, // Wait 5s between retries
        // Cache responses locally
        provider: () => new Map(),
      }}
    >
      {children}
    </SWRConfig>
  );
}
