import type { Metadata } from "next";
import "./globals.css";
import { SolanaProvider } from "@/components/solanaProvider";
import { ThemeProvider } from "@/components/themeProvider"
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SolanaProvider>{children}</SolanaProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
