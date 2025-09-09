// components/TraceCard.tsx

'use client';
import { TraceAccount } from "@/utils/types";
import { useMemo } from "react";

interface TraceCardProps {
  traceData: TraceAccount | null;
}

export default function TraceCard({ traceData }: TraceCardProps) {
  const CHUNK_SIZE = 4; // 每行显示的数量

  const chunkedRecords = useMemo(() => {
    if (!traceData?.records || traceData.records.length === 0) {
      return [];
    }

    // **关键改动：删除了我的错误排序！**
    // 直接使用从链上获取的、默认按时间顺序（从旧到新）的 records 数组。
    const originalRecords = traceData.records;

    const chunks: typeof originalRecords[] = [];
    for (let i = 0; i < originalRecords.length; i += CHUNK_SIZE) {
      chunks.push(originalRecords.slice(i, i + CHUNK_SIZE));
    }
    return chunks;

  }, [traceData]);

  if (!traceData) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      <h2 className="text-3xl font-bold text-center sm:text-left">
        产品 ID:{" "}
        <span className="text-indigo-600 dark:text-indigo-400 font-mono break-all">
          {traceData.productId}
        </span>
      </h2>

      {chunkedRecords.length > 0 ? (
        <>
          <h3 className="text-2xl font-bold mb-4">追溯记录:</h3>
          <div className="flex flex-col gap-y-12">
            {chunkedRecords.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`flex items-start gap-x-6 flex-wrap ${rowIndex % 2 !== 0 ? "sm:flex-row-reverse" : ""
                  }`}
              >
                {row.map((record, itemIndex) => {
                  const totalRecords = traceData.records.length;
                  const globalIndex = rowIndex * CHUNK_SIZE + itemIndex;
                  const isReversedRow = rowIndex % 2 !== 0;
                  const isLastRow = rowIndex === chunkedRecords.length - 1;
                  const isLastItem = globalIndex === totalRecords - 1;
                  const showHorizontalArrow = !isLastItem && itemIndex < row.length - 1;
                  const showVerticalArrow = !isLastRow && itemIndex === row.length - 1;

                  return (
                    <div key={globalIndex} className="relative flex-1 min-w-[200px] mb-6 sm:mb-0">
                      <div className="shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl w-full h-full">
                        <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          {/* **逻辑修正：** 为了匹配从旧到新的时间流，步骤号应该是递增的。 */}
                          步骤 {globalIndex + 1}
                        </h4>
                        <p className="mt-2 text-gray-800 dark:text-gray-200">
                          {record.description}
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {/* **技术BUG修复：** 这里是必须的改动，否则会显示 Invalid Date */}
                          {new Date(record.ts * 1000).toLocaleString()}
                        </p>
                      </div>

                      {/* 您的箭头逻辑完全保留，因为它是正确的 */}
                      {showHorizontalArrow && (
                        <div className={`hidden sm:block absolute top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 z-10 ${isReversedRow ? "left-[-1.75rem] " : "right-[-1.75rem]"}`}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                          </svg>
                        </div>
                      )}
                      {showVerticalArrow && (
                        <div className="hidden sm:block absolute w-6 h-6 text-gray-400 z-10 bottom-[-2.75rem] left-1/2 -translate-x-1/2 rotate-90">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-center text-lg mt-8">
          该产品已初始化，但暂无追溯记录。
        </p>
      )}
    </div>
  );
}