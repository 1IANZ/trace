import { SolanaProvider } from "@/components/SolanaProvider";
import type { Metadata } from "next";

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
      <body>
        <SolanaProvider>{children}</SolanaProvider>
      </body>
    </html>
  );
}
