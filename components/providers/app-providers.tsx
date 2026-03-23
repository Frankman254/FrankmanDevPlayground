"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";

import { LocaleProvider } from "@/components/providers/locale-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
          },
        },
      }),
  );

  return (
		<QueryClientProvider client={queryClient}>
			<LocaleProvider>{children}</LocaleProvider>
		</QueryClientProvider>
  );
}
