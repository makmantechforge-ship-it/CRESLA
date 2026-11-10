'use client';

import React from 'react';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function FilterChip({ label, selected, onClick, icon }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
        ${selected 
          ? 'bg-primary text-white border-transparent scale-[1.02] shadow-sm' 
          : 'bg-white text-slate-700 border-slate-200 hover:border-primary/40'
        }
        border
      `}
    >
      {icon && <span className={selected ? 'text-white' : 'text-slate-400'}>{icon}</span>}
      {label}
    </button>
  );
}
