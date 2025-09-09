export function parseRpcError(err: any): string {
  let anchorErrorCode: number | undefined;
  if (err.error?.errorCode?.code) {
    const codeMap: { [key: string]: number } = {
      'InvalidIndex': 0, 'UnauthorizedUser': 1, 'UnauthorizedAdmin': 2,
    };
    anchorErrorCode = codeMap[err.error.errorCode.code];
  } else if (err.simulationError?.err?.InstructionError?.[1]?.Custom !== undefined) {
    anchorErrorCode = err.simulationError.err.InstructionError[1].Custom;
  } else if (err.code >= 6000 && err.code < 7000) {
    anchorErrorCode = err.code % 6000;
  }

  if (anchorErrorCode !== undefined) {
    switch (anchorErrorCode) {
      case 0: return "索引无效或超出范围。";
      case 1: return "当前用户没有执行此操作的权限。";
      case 2: return "没有管理员权限。";
      default: return `发生未知的程序错误 (代码: ${anchorErrorCode})。`;
    }
  }


  const errString = JSON.stringify(err);
  if (err.code === 4001 || errString.includes("User rejected the request")) {
    return "您拒绝了交易请求。";
  }
  if (errString.includes("failed to send transaction") || errString.includes("Transaction simulation failed")) {
    return "交易发送失败。";
  }
  if (errString.includes("Blockhash not found") || errString.includes("Timed out")) {
    return "交易超时，请重试。";
  }


  return err.message || "发生未知错误，请稍后重试。";
}


export type RpcResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function handleRpc<T>(promise: Promise<T>): Promise<RpcResult<T>> {
  try {
    const result = await promise;
    return { success: true, data: result };
  } catch (err) {
    const errorMessage = parseRpcError(err);
    return { success: false, error: errorMessage };
  }
}