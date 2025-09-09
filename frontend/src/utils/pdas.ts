
import { BN, Program, web3 } from "@coral-xyz/anchor";
import IDL from "../anchor/idl/trace.json";
import { Trace } from "@/anchor/types/trace";
import { handleRpc } from "./error";


function getTracePDA(productId: string): web3.PublicKey {
  const programId = new web3.PublicKey(IDL.address);
  const [traceAccount, _] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('trace'), Buffer.from(productId)],
    programId
  );
  return traceAccount;
}

function getWhitelistPDA(): web3.PublicKey {
  const programId = new web3.PublicKey(IDL.address);
  const [whitelistAccount, _] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from('whitelist')],
    programId
  );
  return whitelistAccount;
}

async function fetchWhitelist(program: Program<Trace>): Promise<web3.PublicKey[]> {
  const whitelistPda = getWhitelistPDA();
  try {
    const whitelistAccount = await program.account.whitelistAccount.fetch(whitelistPda);
    return whitelistAccount.whitelistedUsers as web3.PublicKey[];
  } catch (err) {
    console.warn("无法获取白名单，可能尚未初始化:", err);
    return [];
  }
}

async function fetchtrace(program: Program<Trace>, productId: string) {
  const productPda = getTracePDA(productId);
  try {
    const accountInfo = await program.provider.connection.getAccountInfo(productPda);
    if (accountInfo === null) {
      return null; // 明确表示账户不存在
    }
    return await program.account.traceAccount.fetch(productPda);
  } catch (err) {
    console.error("获取溯源信息时发生意外错误:", err);
    throw err;
  }
}

// 添加用户到白名单
async function addUserToWhitelist(program: Program<Trace>, userToAdd: web3.PublicKey) {
  const whitelistPda = getWhitelistPDA();
  const txPromise = program.methods
    .addUserToWhitelist(userToAdd)
    .accounts({
      whitelistAccount: whitelistPda,
      admin: program.provider.publicKey!,
    })
    .rpc();
  return handleRpc(txPromise);
}

// 从白名单移除用户
async function removeUserFromWhitelist(program: Program<Trace>, userToRemove: web3.PublicKey) {
  const whitelistPda = getWhitelistPDA();
  const txPromise = program.methods
    .removeUserFromWhitelist(userToRemove)
    .accounts({
      whitelistAccount: whitelistPda,
      admin: program.provider.publicKey!,
    })
    .rpc();
  return handleRpc(txPromise);
}

// 初始化溯源
async function initTrace(program: Program<Trace>, productId: string) {
  const tracePda = getTracePDA(productId);
  const whitelistPda = getWhitelistPDA();
  const txPromise = program.methods
    .initTrace(productId)
    .accounts({
      traceAccount: tracePda,
      whitelistAccount: whitelistPda,
      user: program.provider.publicKey!,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  return handleRpc(txPromise);
}

// 添加记录
async function appendRecord(program: Program<Trace>, productId: string, description: string) {
  const tracePda = getTracePDA(productId);
  const whitelistPda = getWhitelistPDA();
  const txPromise = program.methods
    .appendRecord(description)
    .accounts({
      traceAccount: tracePda,
      whitelistAccount: whitelistPda,
      user: program.provider.publicKey!,
    })
    .rpc();
  return handleRpc(txPromise);
}

// 更新记录
async function updateRecord(program: Program<Trace>, productId: string, index: number, newDescription: string) {
  const tracePda = getTracePDA(productId);
  const whitelistPda = getWhitelistPDA();
  const txPromise = program.methods
    .updateRecord(new BN(index), newDescription)
    .accounts({
      traceAccount: tracePda,
      whitelistAccount: whitelistPda,
      user: program.provider.publicKey!,
    })
    .rpc();
  return handleRpc(txPromise);
}

// 删除记录
async function deleteRecord(program: Program<Trace>, productId: string, index: number) {
  const tracePda = getTracePDA(productId);
  const whitelistPda = getWhitelistPDA();
  const txPromise = program.methods
    .delete(new BN(index))
    .accounts({
      traceAccount: tracePda,
      whitelistAccount: whitelistPda,
      user: program.provider.publicKey!,
    })
    .rpc();
  return handleRpc(txPromise);
}

// 清空所有记录
async function clearRecords(program: Program<Trace>, productId: string) {
  const tracePda = getTracePDA(productId);
  const whitelistPda = getWhitelistPDA();
  const txPromise = program.methods
    .clear()
    .accounts({
      traceAccount: tracePda,
      whitelistAccount: whitelistPda,
      user: program.provider.publicKey!,
    })
    .rpc();
  return handleRpc(txPromise);
}

export {
  fetchWhitelist, fetchtrace, addUserToWhitelist, removeUserFromWhitelist,
  initTrace, appendRecord, updateRecord, deleteRecord, clearRecords,
  getTracePDA, getWhitelistPDA
};