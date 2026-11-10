import React from 'react';
import { X } from 'lucide-react';

interface FilterSummaryProps {
  filters: { label: string; onRemove: () => void }[];
  onClearAll: () => void;
}

export function FilterSummary({ filters, onClearAll }: FilterSummaryProps) {
  if (!filters || filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter, index) => (
        <div
          key={index}
          className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
        >
          <span>{filter.label}</span>
          <button
            onClick={filter.onRemove}
            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors focus:outline-none"
            aria-label={`Remove filter ${filter.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-slate-500 hover:text-slate-900 underline underline-offset-2 ml-2"
      >
        Clear all
      </button>
    </div>
  );
}
