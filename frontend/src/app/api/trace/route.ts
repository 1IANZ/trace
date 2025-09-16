import { web3 } from "@coral-xyz/anchor";
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import IDL from "@/anchor/idl/trace.json";
import { Trace } from "@/anchor/types/trace";
import { fetchtrace } from "@/utils/pdas";
import { NextResponse } from "next/server";
import { TraceAccount } from "@/utils/types";

const secret = JSON.parse(process.env.WALLET_SECRET as string);
const wallet = web3.Keypair.fromSecretKey(Uint8Array.from(secret));
const connection = new web3.Connection("https://api.devnet.solana.com", "confirmed");
const provider = new AnchorProvider(
  connection,
  {
    publicKey: wallet.publicKey,
    signTransaction: async (tx: any) => tx,
    signAllTransactions: async (txs: any) => txs,
  } as any,
  { commitment: "confirmed" }
);
const program = new Program<Trace>(IDL as any, provider);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "缺少 id" }, { status: 400 });
    }
    let traceData: TraceAccount | null = null;
    try {
      traceData = await fetchtrace(program, id);
    } catch (err) {
      console.error("链上查询失败:", err);
      return NextResponse.json({ error: "链上查询失败" }, { status: 500 });
    }

    return NextResponse.json(traceData);
  } catch (err: any) {
    console.error("请求处理失败:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
