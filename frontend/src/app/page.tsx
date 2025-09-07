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
import { Button } from "@/components/ui/button";


// const dummyTraceData = {
//   productId: '1A2B3C4D5E6F',
//   records: [
//     { ts: new Date().getTime() / 1000 - 86400, description: '产品在工厂完成加工并打包。' },
//     { ts: new Date().getTime() / 1000 - 43200, description: '产品进入冷链物流运输。' },
//     { ts: new Date().getTime() / 1000, description: '产品到达零售仓库。' },
//   ],
// };

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

  return (
    <>
      <TitleBar />
      <div className="flex justify-center  pt-16">

      </div >
    </>
  );
};


