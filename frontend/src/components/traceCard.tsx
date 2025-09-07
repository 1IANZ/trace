'use client';
import { TraceAccount } from "@/utils/types";
import { Separator } from "@radix-ui/react-dropdown-menu";
import { useMemo } from "react";

interface TraceCardProps {
  traceData: TraceAccount;
}

export default function TraceCard({ traceData }: TraceCardProps) {
  const CHUNK_SIZE = 4;
  const chunkedRecords = useMemo(() => {
    if (!traceData?.records) return [];
    const chunks: typeof traceData.records[] = [];
    for (let i = 0; i < traceData.records.length; i += CHUNK_SIZE) {
      chunks.push(traceData.records.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }, [traceData]);

  return (
    <>
      {traceData && (
        <div className="mt-8 space-y-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50">
            产品 ID:{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              {traceData.productId}
            </span>
          </h2>

          <Separator className="bg-gray-300 dark:bg-gray-700" />

          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">
            追溯记录:
          </h3>

          <div className="flex flex-col gap-y-12">
            {chunkedRecords.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`flex items-start gap-x-6 flex-wrap ${rowIndex % 2 !== 0 ? "sm:flex-row-reverse" : ""
                  }`}
              >
                {row.map((record, itemIndex) => {
                  const globalIndex = rowIndex * CHUNK_SIZE + itemIndex;
                  const isReversedRow = rowIndex % 2 !== 0;
                  const isLastRow = rowIndex === chunkedRecords.length - 1;
                  const isLastItem = globalIndex === traceData.records.length - 1;

                  // 判断是否显示水平箭头
                  const showHorizontalArrow = !isLastItem && itemIndex < row.length - 1;

                  // 判断是否显示垂直箭头（当前行最后一个元素，且不是最后一行）
                  const showVerticalArrow = !isLastRow && itemIndex === row.length - 1;

                  return (
                    <div key={globalIndex} className="relative flex-1 min-w-0">
                      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700 transition-all hover:shadow-xl w-full">
                        <h4 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                          步骤 {globalIndex + 1}
                        </h4>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          {record.description}
                        </p>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(record.ts * 1000).toLocaleString()}
                        </p>
                      </div>

                      {/* 水平箭头 */}
                      {showHorizontalArrow && (
                        <div
                          className={`hidden sm:block absolute top-1/2 -translate-y-1/2 w-4 h-4 z-10 transform-gpu ${isReversedRow
                            ? "left-[-1.5rem] rotate-180"
                            : "right-[-1.5rem]"
                            }`}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-full h-full text-gray-400 dark:text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                            />
                          </svg>
                        </div>
                      )}

                      {/* 纵向箭头 */}
                      {showVerticalArrow && (
                        <div className="hidden sm:block absolute w-4 h-4 z-10 bottom-[-2.5rem] left-1/2 -translate-x-1/2 transform-gpu rotate-90">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-full h-full text-gray-400 dark:text-gray-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {traceData.records.length === 0 && (
            <p className="text-muted-foreground text-center text-lg mt-8">
              暂无追溯记录。
            </p>
          )}
        </div>
      )}
    </>
  );
}