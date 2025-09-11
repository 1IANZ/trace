interface TraceRecord {
  ts: number;
  step: string;
  location: string;
  actor: string;
  description: string;
}

interface TraceAccount {
  productId: string;
  records: TraceRecord[];
}

export type { TraceRecord, TraceAccount };
