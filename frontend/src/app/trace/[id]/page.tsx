'use client';
import { Trace } from "@/anchor/types/trace";
import IDL from "@/anchor/idl/trace.json";
import TitleBar from "@/components/titleBar";
import { TraceAccount } from "@/utils/types";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { fetchtrace } from "@/utils/pdas";
import { Loader2 } from "lucide-react";
import TraceCard from "@/components/traceCard";

export default function Page() {
  const id = useParams().id?.toString();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const [program, setProgram] = useState<Program<Trace> | null>(null);
  const [loading, setLoading] = useState(false);
  const [traceData, setTraceData] = useState<TraceAccount | null>(null);
  const [balance, setBalance] = useState<number>(0);

  // 初始化 Program
  useEffect(() => {
    if (!wallet) return;
    const provider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
    const programInstance = new Program<Trace>(IDL as any, provider);
    setProgram(programInstance);
  }, [connection, wallet]);

  // 查询余额 + traceData
  useEffect(() => {
    if (!program || !id) return;

    const fetchBalance = async () => {
      if (!publicKey) return;
      try {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / 1_000_000_000);
      } catch (err) {
        console.error('获取余额失败:', err);
      }
    };

    const handleQueryTrace = async () => {
      setLoading(true);
      setTraceData(null);
      try {
        const result = await fetchtrace(program, id);
        setTraceData(result);
      } catch (err) {
        console.error('查询失败:', err);
        setTraceData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
    handleQueryTrace();
  }, [program, id, publicKey, connection]);

  return (
    <>
      <TitleBar solBalance={balance} />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="mt-4 text-gray-500 text-base sm:text-lg">正在加载溯源数据...</p>
          </div>
        ) : traceData && traceData.records.length > 0 ? (
          <TraceCard traceData={traceData} />
        ) : (
          <p className="text-gray-500 text-base sm:text-lg mt-4">暂无溯源数据</p>
        )}
      </div>
    </>
  );
}