import dynamic from 'next/dynamic';
const WalletMultiButton = dynamic(
  () =>
    import('@solana/wallet-adapter-react-ui').then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);
export default function TitleBar() {
  return (
    <header className="flex justify-between m-2">
      <h1 className='text-3xl font-bold'>Trace</h1>
      <WalletMultiButton />
    </header>
  )
}