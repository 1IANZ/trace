import type { NextApiRequest, NextApiResponse } from "next";
import { web3 } from "@coral-xyz/anchor"; import { Program, AnchorProvider } from "@coral-xyz/anchor";
import IDL from "@/anchor/idl/trace.json";
import { Trace } from "@/anchor/types/trace";
import { fetchtrace } from "@/utils/pdas";

const secret = JSON.parse(process.env.WALLET_SECRET as string);
const wallet = web3.Keypair.fromSecretKey(Uint8Array.from(secret));
const connection = new web3.Connection("https://api.devnet.solana.com", "confirmed");
const provider = new AnchorProvider(connection, { publicKey: wallet.publicKey } as any, {});
const program = new Program<Trace>(IDL as any, provider);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "缺少 id" });

    const result = await fetchtrace(program, id.toString());
    res.status(200).json(result);
  } catch (err: any) {
    console.error("查询失败:", err);
    res.status(500).json({ error: err.message });
  }
}
