import type { Metadata } from "next";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { SolanaProvider } from "@/components/SolanaProvider";

export const metadata: Metadata = {
  title: "Trace",
  description: "Trace By Alex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AppRouterCacheProvider options={{ enableCssLayer: true }}>
        <body>
          <SolanaProvider>{children}</SolanaProvider>
        </body>
      </AppRouterCacheProvider>
    </html>
  );
}
