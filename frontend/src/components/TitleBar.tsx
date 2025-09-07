import { ModeToggle } from './themeButton';
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
    <header className="flex justify-between items-center mx-auto p-2 w-full bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold">Trace</h1>

      <div className="flex items-center space-x-3">
        <ModeToggle />
        <div className=" px-3 py-1 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
          {solBalance.toFixed(4)} ◎
        </div>
        <WalletMultiButton />
      </div>
    </header>
  )
}