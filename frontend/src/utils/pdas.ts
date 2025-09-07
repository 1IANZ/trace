import { web3 } from "@coral-xyz/anchor";
import IDL from "../anchor/idl/trace.json";
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
