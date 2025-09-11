interface TraceRecord {
  ts: number;
  step: string;
  actor: string;
  description: string;
}

interface TraceAccount {
  productId: string;
  records: TraceRecord[];
}

export type { TraceRecord, TraceAccount };
