import React from 'react';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === current ? 'w-2 bg-primary' : 'w-2 bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}
