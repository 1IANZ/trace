import { Program, web3 } from "@coral-xyz/anchor";
import IDL from "../anchor/idl/trace.json";
import { Trace } from "@/anchor/types/trace";
function getTracePDA(productId: string): web3.PublicKey {
  const programId = new web3.PublicKey(IDL.address);
  const [traceAccount, _] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('trace'),
      Buffer.from(productId),
    ],
    programId
  );
  return traceAccount;
}

function getWhitelistPDA(): web3.PublicKey {
  const programId = new web3.PublicKey(IDL.address);
  const [whitelistAccount, _] = web3.PublicKey.findProgramAddressSync(
    [
      Buffer.from('whitelist'),
    ],
    programId
  );
  return whitelistAccount;
}

async function fetchWhitelist(program: Program<Trace>) {
  const whitelistPda: web3.PublicKey = getWhitelistPDA()
  try {
    const whitelistAccount = await program.account.whitelistAccount.fetch(whitelistPda);
    return whitelistAccount.whitelistedUsers as web3.PublicKey[];
  } catch (err) {
    console.error("Failed to fetch whitelist:", err);
    return [];
  }
}
async function fetchtrace(program: Program<Trace>, productId: string) {
  const productPda: web3.PublicKey = getTracePDA(productId)
  try {
    const traceAccount = await program.account.traceAccount.fetch(productPda);
    return JSON.parse(JSON.stringify(traceAccount));
  } catch (err) {
    console.error("Failed to fetch trace:", err);
    return JSON.parse(JSON.stringify({}));
  }
}

export { getTracePDA, getWhitelistPDA, fetchWhitelist, fetchtrace };