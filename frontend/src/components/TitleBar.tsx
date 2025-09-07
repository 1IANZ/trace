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
    <header className="flex justify-between mx-auto p-2 z-50 fixed w-full top-0 bg-white">
      <h1 className='text-3xl font-bold text-black '>Trace</h1>
      <WalletMultiButton />
    </header>
  )
}