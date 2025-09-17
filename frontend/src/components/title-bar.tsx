'use client';
import { ModeToggle } from './theme-button';
import dynamic from 'next/dynamic';
const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);
export default function TitleBar({ solBalance }: { solBalance: number }) {
  return (
    <header className="flex justify-between items-center mx-auto p-2 w-full ">
      <h1 className="text-3xl font-bold">Trace</h1>

      <div className="flex items-center space-x-3">
        <ModeToggle />
        <div className=" px-3 py-1 rounded-lg border text-sm font-medium ">
          {solBalance.toFixed(4)}
        </div>
        <WalletMultiButton />
      </div>
    </header>
  )
}
