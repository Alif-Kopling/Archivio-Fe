import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClientProvider } from "@tanstack/react-query";

import { queryClient } from "@/lib/query-client";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="dark">
        {children}
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
