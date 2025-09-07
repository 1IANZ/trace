'use client'
import TitleBar from "@/components/titleBar";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { useEffect, useState, useMemo } from "react";
import IDL from "../anchor/idl/trace.json"
import { Trace } from "../anchor/types/trace"
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-separator";
import { Input } from "@/components/ui/input";
import { TraceAccount } from "@/utils/types";


const dummyTraceData: TraceAccount = {
  productId: '1A2B3C4D5E6F',
  records: [
    // { ts: new Date().getTime() / 1000 - 172800, description: '原料采购完成，并进行质量检验。' },
    // { ts: new Date().getTime() / 1_000_000_000 - 129600, description: '产品在工厂完成加工并打包。' },
    // { ts: new Date().getTime() / 1000 - 86400, description: '产品进入冷链物流运输，发货地：XX仓。' },
    // { ts: new Date().getTime() / 1000 - 43200, description: '产品抵达YY市分拨中心。' },
    // { ts: new Date().getTime() / 1000, description: '产品到达零售仓库，已签收。' },
    // { ts: new Date().getTime() / 1000 + 43200, description: '产品通过线上渠道售出。' },
    // { ts: new Date().getTime() / 1000 + 86400, description: '用户收到产品并进行首次使用。' },
    // { ts: new Date().getTime() / 1000 + 129600, description: '产品售后服务记录。' },
  ],
};

export default function Home() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [balance, setBalance] = useState<number>(0);
  const [program, setProgram] = useState<Program<Trace>>();

  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [traceData, setTraceData] = useState(dummyTraceData);

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
    const program: Program<Trace> = new Program(IDL as any, provider);
    setProgram(program);
    console.log(program)
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

  const chunkedRecords = useMemo(() => {
    if (!traceData?.records) return [];
    const chunks: typeof traceData.records[] = [];
    for (let i = 0; i < traceData.records.length; i += 4) {
      chunks.push(traceData.records.slice(i, i + 4));
    }
    return chunks;
  }, [traceData]);

  return (
    <>
      <TitleBar solBalance={balance} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">

          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-50 tracking-tight sm:text-5xl">
              产品追溯信息查询
            </h1>
            <p className="mt-3 text-xl text-gray-600 dark:text-gray-400">
              输入产品 ID，查看产品从生产到交付的完整生命周期。
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-grow w-full">
              <label htmlFor="productId" className="sr-only">产品 ID</label>
              <Input
                id="productId"
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="请输入产品 ID"
                className="w-full text-lg h-12"
              />
            </div>
            <Button
              className="w-full sm:w-auto h-12 px-6 text-lg"
              disabled={loading}
            >
              查询
            </Button>
          </div>

          {traceData && (
            <div className="mt-8 space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
                产品 ID: <span className="text-indigo-600 dark:text-indigo-400">{traceData.productId}</span>
              </h2>
              <Separator className="bg-gray-300 dark:bg-gray-700" />

              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">追溯记录:</h3>

              <div className="flex flex-col gap-y-12">
                {chunkedRecords.map((row, rowIndex) => (
                  <div key={rowIndex} className={`flex items-start gap-x-6 flex-wrap ${rowIndex % 2 !== 0 ? 'sm:flex-row-reverse' : ''}`}>
                    {row.map((record, itemIndex) => {
                      const globalIndex = rowIndex * 4 + itemIndex;
                      const isReversedRow = rowIndex % 2 !== 0;

                      const isLastInVisualRow = isReversedRow
                        ? itemIndex === 0
                        : itemIndex === row.length - 1;

                      const isLastItem = globalIndex === traceData.records.length - 1;
                      const isLastRow = rowIndex === chunkedRecords.length - 1;

                      return (
                        <div key={globalIndex} className="relative flex-1 min-w-0">
                          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl w-full">
                            <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                              步骤 {globalIndex + 1}
                            </h4>
                            <p className="mt-2 text-gray-700 dark:text-gray-300">
                              {record.description}
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              {new Date(record.ts * 1000).toLocaleString()}
                            </p>
                          </div>

                          {!isLastInVisualRow && !isLastItem && (
                            <div
                              className={[
                                "hidden sm:block absolute top-1/2 -translate-y-1/2 w-4 h-4 z-10 transform-gpu",
                                isReversedRow ? "left-[-1.5rem] rotate-180" : "right-[-1.5rem]"
                              ].join(" ")}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-full h-full text-gray-400 dark:text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                              </svg>
                            </div>
                          )}

                          {isLastInVisualRow && !isLastRow && (
                            <div className="hidden sm:block absolute w-4 h-4 z-10 bottom-[-2.5rem] left-1/2 -translate-x-1/2 transform-gpu rotate-90">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-full h-full text-gray-400 dark:text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                              </svg>
                            </div>
                          )}
                        </div>
                      );
                    })}

                  </div>
                ))}
              </div>

              {traceData.records.length === 0 && (
                <p className="text-muted-foreground text-center text-lg mt-8">
                  暂无追溯记录。
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
