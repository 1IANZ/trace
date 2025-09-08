'use client';
import TitleBar from "@/components/titleBar";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from '@solana/wallet-adapter-react';
import { useEffect, useState } from "react";
import IDL from "../anchor/idl/trace.json"
import { Trace } from "../anchor/types/trace"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TraceAccount } from "@/utils/types";
import { fetchWhitelist } from "@/utils/pdas";
import TraceCard from "@/components/traceCard";
import { useRouter } from 'next/navigation';

const TraceData: TraceAccount = {
  productId: '10001',
  records: [
    { ts: new Date().getTime() / 1000 - 172800, description: '原料采购完成，并进行质量检验。' },
    { ts: new Date().getTime() / 1000 - 129600, description: '产品在工厂完成加工并打包。' },
    { ts: new Date().getTime() / 1000 - 86400, description: '产品进入冷链物流运输，发货地：XX仓。' },
    { ts: new Date().getTime() / 1000 - 43200, description: '产品抵达YY市分拨中心。' },
    { ts: new Date().getTime() / 1000, description: '产品到达零售仓库，已签收。' },
    { ts: new Date().getTime() / 1000 + 43200, description: '产品通过线上渠道售出。' },
    { ts: new Date().getTime() / 1000 + 86400, description: '用户收到产品并进行首次使用。' },
    { ts: new Date().getTime() / 1000 + 129600, description: '产品售后服务记录。' },
  ],
};


export default function Home() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [balance, setBalance] = useState<number>(0);
  const [program, setProgram] = useState<Program<Trace>>();
  const [productId, setProductId] = useState('');
  const [loading, setLoading] = useState(false);

  const [isWhitelisted, setIsWhitelisted] = useState(false);
  useEffect(() => {
    async function Initialize() {
      if (!wallet) {
        return null;
      }
      const provider = new AnchorProvider(connection, wallet, {
        commitment: 'confirmed',
      });
      const program: Program<Trace> = new Program(IDL as any, provider);
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
    fetchBalance();
    Initialize();
  }, [publicKey, connection]);

  useEffect(() => {
    async function checkWhitelist() {
      if (program && publicKey) {
        const whitelistUsers = await fetchWhitelist(program);
        setIsWhitelisted(whitelistUsers.some(pk => pk.toString() === publicKey.toString()));
      }
    }
    checkWhitelist();
  }, [program, publicKey]);





  return (
    <>
      <TitleBar solBalance={balance} />
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extraboldtracking-tight sm:text-5xl">
              产品追溯信息查询
            </h1>
            <p className="mt-3 text-xl">
              输入产品 ID，查看产品从生产到交付的完整生命周期。
            </p>
          </div>
          <div className="shadow-lg rounded-lg p-6 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-grow w-full">
              <label htmlFor="productId" className="sr-only">产品 ID</label>
              <Input
                id="productId"
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="请输入产品 ID"
                className="w-full text-lg h-12" />
            </div>
            <div className="flex flex-row items-center space-x-4">
              <Button
                className="w-full sm:w-auto h-12 px-6 text-lg cursor-pointer"
                disabled={loading}
                onClick={() => {
                  console.log(isWhitelisted)
                }}
              >
                查询
              </Button>
              {isWhitelisted
                ? (
                  <Button
                    className="w-full sm:w-auto h-12 px-6 text-lg cursor-pointer"
                    disabled={loading}
                    onClick={() => {
                      router.push(`/admin`);
                    }}
                  >
                    操作
                  </Button>
                ) : null
              }
            </div>
          </div>
          <TraceCard traceData={TraceData} />
        </div>
      </div >
    </>
  );
}
