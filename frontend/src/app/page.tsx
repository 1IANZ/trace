"use client";
import dynamic from "next/dynamic";
import IDL from "../../anchor/idl/trace.json";
import { Trace } from "../../anchor/types/trace";
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function Home() {
  return (
    <div>
      <WalletMultiButton />
    </div>
  );
}
