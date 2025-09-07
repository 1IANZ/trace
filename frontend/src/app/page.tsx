'use client'
import TitleBar from "@/components/TitleBar";
import { AnchorProvider, BN, Program, web3 } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { useEffect, useState } from "react";
import IDL from "../anchor/idl/trace.json"
import { Trace } from "../anchor/types/trace"
export default function Home() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useAnchorWallet();
  const [balance, setBalance] = useState(0);
  const [program, setProgram] = useState<Program<Trace>>();
  useEffect(() => {
    fetchBalance();
    Initialize();
  }, [publicKey, connection]);

  async function Initialize() {
    if (!wallet) {
      return null;
    }
    const provider = new AnchorProvider(connection, wallet, {
      commitment: 'confirmed',
    });
    const program: Program<Trace> = new Program(IDL, provider);
    setProgram(program);
  }
  const fetchBalance = async () => {
    if (publicKey) {
      try {
        const lamports = await connection.getBalance(publicKey!);
        const sol = lamports / 1_000_000_000;
        setBalance(sol);
      } catch (err) {
        console.error('Failed to fetch balance:', err);
      }
    }
  };

  function get_PDA(productId: string): web3.PublicKey {
    const programId = new web3.PublicKey(IDL.address);
    const [traceAccount, _] = web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from('trace'),
        Buffer.from(productId)
      ],
      programId
    );
    return traceAccount;
  }

  return (
    <TitleBar />


  )
}
