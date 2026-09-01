import React from 'react';

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-0 w-full">
      <div className="aspect-[4/3] w-full bg-slate-200 animate-pulse" />
      <div className="p-3 pt-4 space-y-3">
        <div className="h-5 bg-slate-200 animate-pulse rounded-md w-3/4" />
        <div className="h-4 bg-slate-200 animate-pulse rounded-md w-1/2" />
        <div className="h-3 bg-slate-200 animate-pulse rounded-md w-2/3 mt-2" />
      </div>
    </div>
  );
}
