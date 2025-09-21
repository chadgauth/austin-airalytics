"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/utils/trpc";

const queryClient = new QueryClient();

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return (
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </trpc.Provider>
  );
}