import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Trace } from "../target/types/trace";
import { assert } from "chai";

describe("trace PDA test", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Trace as Program<Trace>;
  const user = provider.wallet;

  const productId = `product-${Date.now()}`;
  let tracePda: anchor.web3.PublicKey;

  before(async () => {
    [tracePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("trace"), Buffer.from(productId)],
      program.programId
    );
    console.log(`Using Product ID: ${productId}`);
    console.log(`Trace Account PDA: ${tracePda.toBase58()}`);
  });


  it("Initializes the trace account", async () => {
    await program.methods.initTrace(productId)
      .accounts({
        traceAccount: tracePda, // Anchor 客户端约定使用驼峰命名
        user: user.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();


    const account = await program.account.traceAccount.fetch(tracePda);

    assert.strictEqual(account.productId, productId, "Product ID should match the one provided");
    assert.deepStrictEqual(account.records, [], "Records array should be empty after initialization");

    console.log("Initialized trace_account:", account);
  });

  it("Appends the first record (添加第一条记录)", async () => {
    const description = "工厂加工完成";
    await program.methods.appendRecord(description)
      .accounts({
        traceAccount: tracePda,
        user: user.publicKey,
      })
      .rpc();

    const account = await program.account.traceAccount.fetch(tracePda);
    console.log("After appendRecord 1:", account);

    // 断言验证
    assert.equal(account.records.length, 1, "Should have one record");
    assert.equal(account.records[0].description, description, "The description of the first record should match");
    assert.isNotNull(account.records[0].ts, "Timestamp should be set");
  });

  it("Gets all trace records (获取全部记录)", async () => {
    const traceInfo = await program.methods.getTrace()
      .accounts({ traceAccount: tracePda })
      .view();

    console.log("Fetched TraceInfo:", traceInfo);

    assert.equal(traceInfo.productId, productId, "Product ID in view should match");
    assert.equal(traceInfo.records.length, 1, "Should return one record");
    assert.equal(traceInfo.records[0].description, "工厂加工完成", "Description in view should match");
  });

  it("Appends a second record (添加第二条记录)", async () => {
    const description = "进入冷链运输";
    await program.methods.appendRecord(description)
      .accounts({ traceAccount: tracePda, user: user.publicKey })
      .rpc();

    const traceInfo = await program.methods.getTrace()
      .accounts({ traceAccount: tracePda })
      .view();

    console.log("After appendRecord 2:", traceInfo);

    assert.equal(traceInfo.records.length, 2, "Should have two records now");
    assert.equal(traceInfo.records[1].description, description, "The second record's description should match");
  });

  it("Deletes a record by index (删除记录)", async () => {
    await program.methods.delete(new anchor.BN(0))
      .accounts({ traceAccount: tracePda, user: user.publicKey })
      .rpc();

    const traceInfo = await program.methods.getTrace()
      .accounts({ traceAccount: tracePda })
      .view();

    console.log("After delete:", traceInfo);

    assert.equal(traceInfo.records.length, 1, "Should have one record remaining");
    assert.equal(traceInfo.records[0].description, "进入冷链运输", "The remaining record should be the correct one");
  });

  it("Fails to delete with an invalid index (使用无效索引删除并预期失败)", async () => {
    try {
      // 当前记录数组长度为 1，所以索引 1 是无效的
      await program.methods.delete(new anchor.BN(1))
        .accounts({ traceAccount: tracePda, user: user.publicKey })
        .rpc();
      assert.fail("Transaction should have failed with InvalidIndex error");
    } catch (err) {
      assert.include(err.toString(), "InvalidIndex", "Error message should contain 'InvalidIndex'");
      console.log("Successfully caught expected error for invalid index.");
    }
  });


  it("Clears all records (清空记录)", async () => {
    await program.methods.clear()
      .accounts({ traceAccount: tracePda, user: user.publicKey })
      .rpc();

    const traceInfo = await program.methods.getTrace()
      .accounts({ traceAccount: tracePda })
      .view();

    console.log("After clear:", traceInfo);

    // 断言验证
    assert.equal(traceInfo.records.length, 0, "Records array should be empty after clear");
  });
});