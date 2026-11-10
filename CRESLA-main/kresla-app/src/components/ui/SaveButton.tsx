'use client';

import React from 'react';
import { Heart } from 'lucide-react';

interface SaveButtonProps {
  saved: boolean;
  onToggle: (e: React.MouseEvent) => void;
}

export function SaveButton({ saved, onToggle }: SaveButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggle(e);
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors hover:bg-white focus:outline-none"
      aria-label={saved ? "Remove from saved" : "Save property"}
    >
      <Heart
        className={`w-5 h-5 transition-all duration-300 ${
          saved
            ? 'fill-red-500 text-red-500 animate-[heartPop_300ms_cubic-bezier(0.175,0.885,0.32,1.275)]'
            : 'text-slate-400 hover:text-red-400'
        }`}
      />
    </button>
  );
}
