import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

export function EmptyState({ title, description, icon, actions }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-16 px-4">
      {icon && (
        <div className="text-slate-300 w-16 h-16 mb-4 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2">{description}</p>
      
      {actions && actions.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={index === 0 ? 'primary' : 'secondary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
