'use client';
import { TraceAccount } from "@/utils/types";
import { useMemo } from "react";

interface traceProps {
  traceData: TraceAccount | null;
}

export default function TraceCard({ traceData }: traceProps) {
  const CHUNK_SIZE = 4;

  const chunkedRecords = useMemo(() => {
    if (!traceData?.records || traceData.records.length === 0) {
      return [];
    }

    const originalRecords = traceData.records;
    const chunks: typeof originalRecords[] = [];
    for (let i = 0; i < originalRecords.length; i += CHUNK_SIZE) {
      chunks.push(originalRecords.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }, [traceData]);

  const displayData = traceData;
  const displayChunks = useMemo(() => {
    if (!displayData?.records || displayData.records.length === 0) {
      return [];
    }

    const originalRecords = displayData.records;
    const chunks: typeof originalRecords[] = [];
    for (let i = 0; i < originalRecords.length; i += CHUNK_SIZE) {
      chunks.push(originalRecords.slice(i, i + CHUNK_SIZE));
    }
    return chunks;
  }, [displayData]);

  if (!displayData) {
    return null;
  }

  const getStepColorClass = (step: number) => {
    const colors = [
      "from-blue-500 to-blue-600 shadow-blue-200 dark:shadow-blue-900/50",
      "from-green-500 to-green-600 shadow-green-200 dark:shadow-green-900/50",
      "from-purple-500 to-purple-600 shadow-purple-200 dark:shadow-purple-900/50",
      "from-orange-500 to-orange-600 shadow-orange-200 dark:shadow-orange-900/50",
      "from-pink-500 to-pink-600 shadow-pink-200 dark:shadow-pink-900/50",
      "from-indigo-500 to-indigo-600 shadow-indigo-200 dark:shadow-indigo-900/50"
    ];
    return colors[(step - 1) % colors.length];
  };

  const getStepBgPattern = (step: number) => {
    const patterns = [
      "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
      "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20",
      "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
      "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20",
      "bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20"
    ];
    return patterns[(step - 1) % patterns.length];
  };

  return (
    <div className="mt-6 sm:mt-8 space-y-8">
      {displayChunks.length > 0 ? (
        <div className="flex flex-col gap-y-16">
          {displayChunks.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className={`flex items-start gap-x-8 flex-wrap ${rowIndex % 2 !== 0 ? "sm:flex-row-reverse" : ""
                }`}
            >
              {row.map((record, itemIndex) => {
                const totalRecords = displayData.records.length;
                const globalIndex = rowIndex * CHUNK_SIZE + itemIndex;
                const isReversedRow = rowIndex % 2 !== 0;
                const isLastRow = rowIndex === displayChunks.length - 1;
                const isLastItem = globalIndex === totalRecords - 1;
                const showHorizontalArrow = !isLastItem && itemIndex < row.length - 1;
                const showVerticalArrow = !isLastRow && itemIndex === row.length - 1;

                return (
                  <div key={globalIndex} className="relative flex-1 min-w-[280px] mb-8 sm:mb-0">
                    {/* 主卡片 */}
                    <div className={`group relative overflow-hidden shadow-lg rounded-2xl p-6 bg-background border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${getStepBgPattern(parseInt(record.step))}`}>
                      {/* 装饰性背景元素 */}
                      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
                        <div className={`w-full h-full bg-gradient-to-br ${getStepColorClass(parseInt(record.step))} rounded-full blur-3xl`}></div>
                      </div>

                      <div className="relative flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={`relative w-14 h-14 bg-gradient-to-br ${getStepColorClass(parseInt(record.step))} rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-transform group-hover:scale-110`}>
                            <span className="text-xl font-bold">{record.step}</span>
                            <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:animate-ping"></div>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">步骤</div>
                            <div className="text-sm font-semibold text-foreground">流程 {record.step}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                          </div>
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">已完成</span>
                        </div>
                      </div>
                      <div className="relative mb-6">
                        <h4 className="text-lg font-semibold mb-3 leading-relaxed text-foreground">
                          {record.description}
                        </h4>
                        <div className={`w-12 h-1 bg-gradient-to-r ${getStepColorClass(parseInt(record.step))} rounded-full transform origin-left transition-all duration-300 group-hover:scale-x-150`}></div>
                      </div>
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted/50 rounded-lg">
                            <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">记录时间</div>
                            <span className="font-mono text-sm font-medium">
                              {new Date(record.ts * 1000).toLocaleString('zh-CN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${getStepColorClass(parseInt(record.step))} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                    </div>

                    {showHorizontalArrow && (
                      <div className={`hidden sm:block absolute top-1/2 -translate-y-1/2 ${isReversedRow ? "left-[-2rem]" : "right-[-2rem]"}`}>
                        <div className="relative">
                          <div className="w-8 h-0.5 bg-gradient-to-r from-muted-foreground/20 to-muted-foreground/40"></div>
                          <svg
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground ${isReversedRow ? "left-0 rotate-180" : "right-0"}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {showVerticalArrow && (
                      <div className="hidden sm:block absolute bottom-[-3.5rem] left-1/2 -translate-x-1/2">
                        <div className="relative">
                          <div className="h-8 w-0.5 bg-gradient-to-b from-muted-foreground/20 to-muted-foreground/40"></div>
                          <svg
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-4 text-muted-foreground"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center mt-8 p-12 sm:p-16 border-2 border-dashed border-muted-foreground/20 rounded-2xl w-full bg-muted/5">
          <div className="w-20 h-20 text-muted-foreground/50 mb-6">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-2xl font-semibold text-foreground mb-2">暂无追溯记录</p>
          <p className="text-muted-foreground max-w-md">
            该产品已成功初始化，但目前还没有任何追溯记录。新的记录将会在这里显示。
          </p>
        </div>
      )}
    </div>
  );
}