"use client";
import React, { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "@/redux/store";
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Toaster position="top-center" reverseOrder={false} />
        <Provider store={store}>
          <SessionProvider>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
          </SessionProvider>
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
