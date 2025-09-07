interface TraceRecord {
  ts: number;
  description: string;
}
interface TraceAccount {
  productId: string;
  records: TraceRecord[];
}

export type { TraceRecord, TraceAccount };
