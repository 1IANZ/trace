'use client';
import TitleBar from "@/components/title-bar";
import TraceCard from "@/components/trace-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { fetchtrace, fetchWhitelist } from "@/utils/pdas";
import { TraceAccount } from "@/utils/types";
import { AnchorProvider, Program, Wallet } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Frown, Info, Loader2, QrCode, Search, Sparkles } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import IDL from "../anchor/idl/trace.json";
import { Trace } from "../anchor/types/trace";

export default function Home() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();

  const [program, setProgram] = useState<Program<Trace> | null>(null);
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [traceData, setTraceData] = useState<TraceAccount | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const getTraceUrl = () => {
    if (typeof window !== 'undefined' && productId) {
      return `${window.location.origin}/trace/${productId}`;
    }
    return '';
  };

  useEffect(() => {
    const initProgram = async () => {
      const dummyWallet = {
        publicKey: null,
        signTransaction: () => Promise.reject("Dummy wallet cannot sign"),
        signAllTransactions: () => Promise.reject("Dummy wallet cannot sign"),
      } as unknown as Wallet;
      const provider = new AnchorProvider(connection, dummyWallet, { commitment: 'confirmed' });
      const programInstance: Program<Trace> = new Program(IDL as any, provider);
      setProgram(programInstance);
    };
    initProgram();
  }, [connection]);

  useEffect(() => {
    if (!program) return;

    const fetchBalance = async () => {
      if (!publicKey) return;
      try {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / 1_000_000_000);
      } catch (err) {
        console.error('获取余额失败:', err);
      }
    };

    const checkWhitelist = async () => {
      if (!wallet) return;
      const signedProvider = new AnchorProvider(connection, wallet, { commitment: 'confirmed' });
      const signedProgram = new Program<Trace>(IDL as any, signedProvider);
      const whitelistUsers = await fetchWhitelist(signedProgram);
      setIsWhitelisted(whitelistUsers.some(pk => pk.toString() === publicKey?.toString()));
    };

    fetchBalance();
    checkWhitelist();
  }, [program, wallet, publicKey, connection]);

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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center mt-8 p-12 sm:p-16 rounded-2xl w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800">
          <div className="relative">
            <Loader2 className="w-16 h-16 animate-spin text-blue-600 dark:text-blue-400" />
            <div className="absolute inset-0 w-16 h-16 bg-blue-600 dark:bg-blue-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-xl font-medium text-foreground">正在从区块链查询数据...</p>
          <p className="mt-2 text-sm text-muted-foreground">请稍候，这可能需要几秒钟</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-8 border-2 shadow-lg">
          <Info className="h-5 w-5" />
          <AlertTitle className="text-lg">查询出错</AlertTitle>
          <AlertDescription className="mt-2">{error}</AlertDescription>
        </Alert>
      );
    }

    if (hasSearched) {
      if (traceData && traceData.records.length > 0) {
        return <TraceCard traceData={traceData} productId={productId} />;
      } else {
        return (
          <div className="flex flex-col items-center justify-center text-center mt-8 p-12 sm:p-16 border-2 border-dashed border-yellow-200 dark:border-yellow-800 rounded-2xl w-full bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
            <div className="relative">
              <Frown className="w-20 h-20 text-yellow-600 dark:text-yellow-400" />
              <div className="absolute inset-0 w-20 h-20 bg-yellow-600 dark:bg-yellow-400 rounded-full blur-2xl opacity-20"></div>
            </div>
            <p className="mt-6 text-2xl font-semibold text-foreground">未找到溯源信息</p>
            <p className="mt-3 text-muted-foreground max-w-md">
              未能找到产品ID为 "<strong className="text-foreground font-mono bg-muted px-2 py-1 rounded">{productId}</strong>" 的溯源信息。
            </p>
            <p className="mt-2 text-sm text-muted-foreground">请检查产品ID是否正确</p>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <>
      <TitleBar solBalance={balance} />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center relative">


            <div className="relative">
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                产品全流程溯源
              </h1>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl"></div>
            <div className="relative shadow-2xl rounded-2xl p-6 sm:p-8 bg-background/95 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-lg font-semibold">快速查询</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="flex-grow relative">
                  <label htmlFor="productId" className="sr-only">产品 ID</label>
                  <div className="relative">
                    <Input
                      id="productId"
                      type="text"
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      placeholder="请输入产品 ID"
                      className="w-full text-lg h-14 pl-5 pr-12 rounded-xl border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                      onKeyDown={(e) => e.key === 'Enter' && handleQueryTrace()}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-row-reverse sm:flex-row">
                  <Button
                    className="h-14 px-8 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl"
                    disabled={loading}
                    onClick={handleQueryTrace}
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-5 w-5" />
                    )}
                    查询
                  </Button>

                  {isWhitelisted && (
                    <Button
                      className="h-14 px-4 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl"
                      onClick={() => router.push(`/admin`)}
                    >
                      管理
                    </Button>
                  )}

                  {productId && (
                    <Popover open={qrOpen} onOpenChange={setQrOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          className="h-14 w-14 p-0 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                          variant="outline"
                          disabled={loading}
                          onMouseEnter={() => setQrOpen(true)}
                          onMouseLeave={() => setQrOpen(false)}
                        >
                          <QrCode className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        side="bottom"
                        className="w-auto p-0 border-0"
                        sideOffset={5}
                        onMouseEnter={() => setQrOpen(true)}
                        onMouseLeave={() => setQrOpen(false)}
                      >
                        <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-2xl border">
                          <p className="text-sm font-medium text-center mb-3">扫码查看溯源信息</p>
                          <div className="bg-white p-3 rounded-lg">
                            <QRCode
                              value={getTraceUrl()}
                              size={200}
                              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                              viewBox={`0 0 256 256`}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-3 break-all max-w-[200px]">
                            {getTraceUrl()}
                          </p>
                          <Button
                            className="w-full mt-3"
                            size="sm"
                            onClick={() => {
                              router.push("/trace/" + productId);
                              setQrOpen(false);
                            }}
                          >
                            前往查看
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>


              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 w-full">
            {renderContent()}
          </div>

          {!hasSearched && (
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { title: "区块链存证", desc: "数据永久保存，不可篡改", icon: "🔐" },
                { title: "全程追溯", desc: "从源头到终端，全程可查", icon: "📍" },
                { title: "实时更新", desc: "供应链信息实时同步", icon: "⚡" }
              ].map((item, index) => (
                <div key={index} className="group p-6 rounded-2xl border bg-card hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}