'use client';
import TitleBar from "@/components/titleBar";
import TraceCard from "@/components/traceCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchtrace, fetchWhitelist } from "@/utils/pdas";
import { TraceAccount } from "@/utils/types";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Frown, Info, Loader2, Search } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import IDL from "../anchor/idl/trace.json";
import { Trace } from "../anchor/types/trace";

export default function Home() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [program, setProgram] = useState<Program<Trace>>();
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [traceData, setTraceData] = useState<TraceAccount | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [isWhitelisted, setIsWhitelisted] = useState(false);

  useEffect(() => {
    const dummyWallet = {
      publicKey: null,
      signTransaction: () => Promise.reject("Dummy wallet cannot sign"),
      signAllTransactions: () => Promise.reject("Dummy wallet cannot sign"),
    } as unknown as Wallet;

    const provider = new AnchorProvider(connection, dummyWallet, { commitment: 'confirmed' });
    const programInstance: Program<Trace> = new Program(IDL as any, provider);
    setProgram(programInstance);
  }, [connection]);

  useEffect(() => {

    const fetchBalance = async () => {
      if (publicKey) {
        try {
          const lamports = await connection.getBalance(publicKey);
          setBalance(lamports / 1_000_000_000);
        } catch (err) {
          console.error('获取余额失败:', err);
        }
      }
    };


    const checkWhitelist = async () => {
      if (program && publicKey) {
        if (!wallet) return;
        const signedProvider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
        const signedProgram = new Program<Trace>(IDL as any, signedProvider);

        const whitelistUsers = await fetchWhitelist(signedProgram);
        setIsWhitelisted(whitelistUsers.some(pk => pk.toString() === publicKey.toString()));
      }
    };

    fetchBalance();
    checkWhitelist();
  }, [publicKey, wallet, program, connection]);

  const handleQueryTrace = async () => {
    if (!program || !productId) {
      setError("请输入产品ID后再查询。");
      return;
    }

    setLoading(true);
    setError('');
    setTraceData(null);
    setHasSearched(true);

    try {
      const result = await fetchtrace(program, productId);
      setTraceData(result);
    } catch (err) {
      console.error('查询失败:', err);
      setError('查询过程中发生未知错误，请稍后重试。');
      setTraceData(null);
    } finally {
      setLoading(false);
    }
  };


  const renderResults = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center mt-8 p-12 border rounded-lg">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="mt-4 text-lg text-muted-foreground">正在从区块链查询数据...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-8">
          <Info className="h-4 w-4" />
          <AlertTitle>查询出错</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (hasSearched) {
      if (traceData && traceData.records.length > 0) {
        return <TraceCard traceData={traceData} />;
      } else {
        return (
          <div className="flex flex-col items-center justify-center text-center mt-8 p-12 border-2 border-dashed rounded-lg">
            <Frown className="w-16 h-16 text-yellow-500" />
            <p className="mt-4 text-xl font-semibold">未找到溯源信息</p>
            <p className="mt-2 text-muted-foreground">
              未能找到产品ID为 "<strong>{productId}</strong >" 的溯源信息。
            </p>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <>
      <TitleBar solBalance={balance} />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              产品全流程溯源
            </h1>
            <p className="mt-3 text-xl text-muted-foreground">
              输入产品 ID，查看产品从生产到交付的完整生命周期。
            </p>
          </div>
          <div className="shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-grow w-full">
              <label htmlFor="productId" className="sr-only">产品 ID</label>
              <Input
                id="productId" type="text" value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="请输入产品 ID" className="w-full text-lg h-12"
                onKeyDown={(e) => e.key === 'Enter' && handleQueryTrace()}
              />
            </div>
            <div className="flex flex-row items-center space-x-4 w-full sm:w-auto">
              <Button
                className="flex-grow sm:flex-grow-0 h-12 px-6 text-lg"
                disabled={loading}
                onClick={handleQueryTrace}
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Search className="mr-2 h-5 w-5" />}
                查询
              </Button>
              {isWhitelisted && (
                <Button
                  className="flex-grow sm:flex-grow-0 h-12 px-6 text-lg"
                  variant="outline"
                  onClick={() => router.push(`/admin`)}
                >
                  操作
                </Button>
              )}
            </div>
          </div>

          <div className="mt-8">
            {renderResults()}
          </div>
        </div>
      </div>
    </>
  );
}
