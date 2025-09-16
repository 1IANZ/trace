'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react";
import TraceCard from "@/components/trace-card";
import { TraceAccount } from "@/utils/types";

export default function Page() {
  const id = useParams().id?.toString();

  const [loading, setLoading] = useState(false);
  const [traceData, setTraceData] = useState<TraceAccount | null>(null);

  useEffect(() => {
    if (!id) return;

    const handleQueryTrace = async () => {
      setLoading(true);
      setTraceData(null);
      try {
        const res = await fetch(`/api/trace?id=${id}`);
        const data = await res.json();
        setTraceData(data);
      } catch (err) {
        console.error('查询失败:', err);
        setTraceData(null);
      } finally {
        setLoading(false);
      }
    };

    handleQueryTrace();
  }, [id]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
            <p className="mt-4 text-gray-500 text-base sm:text-lg">正在加载溯源数据...</p>
          </div>
        ) : traceData && traceData.records.length > 0 ? (
          <TraceCard traceData={traceData} productId={id!} />
        ) : (
          <p className="text-gray-500 text-base sm:text-lg mt-4">暂无溯源数据</p>
        )}
      </div>
    </>
  );
}
