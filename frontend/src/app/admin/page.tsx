'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider } from '@coral-xyz/anchor';
import IDL from '../../anchor/idl/trace.json';
import { Trace } from '../../anchor/types/trace';
import { fetchWhitelist } from '@/utils/pdas';

export default function AdminPage() {
  const router = useRouter();
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [program, setProgram] = useState<Program<Trace> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (!wallet) {
        return null;
      }
      const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
      });
      const program: Program<Trace> = new Program(IDL as any, provider);
      setProgram(program);
      const whitelistUsers = await fetchWhitelist(program);
      const isWhitelisted = whitelistUsers.some(pk => pk.toString() === publicKey!.toString());
      if (!isWhitelisted) {
        router.push('/');
      } else {
        setLoading(false);
      }
    }
    init();
  }, [publicKey, connection]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
          <p className="text-gray-700 dark:text-gray-200 text-lg">Loding...</p>
        </div>
      </div>
    );

  return (
    <div>
      <h1>Admin 操作页面</h1>

    </div>
  );
}
