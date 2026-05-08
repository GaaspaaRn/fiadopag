import React from 'react';
import { formatCurrency } from '@/lib/format';

interface SummaryCardProps {
  title: string;
  value: number;
  type?: 'info' | 'success' | 'danger' | 'warning';
  icon: React.ReactNode;
  isNumber?: boolean;
}

export function SummaryCard({ title, value, type = 'info', icon, isNumber = false }: SummaryCardProps) {
  let colorClass = '';
  if (type === 'danger') colorClass = 'text-red-600';
  if (type === 'success') colorClass = 'text-emerald-600';
  if (type === 'info') colorClass = 'text-slate-900';
  if (type === 'warning') colorClass = 'text-amber-600';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col justify-between transition hover:shadow-md">
      <div className="flex justify-between items-start mb-2 gap-2">
        <h3 className="text-slate-500 text-xs sm:text-sm font-medium leading-tight">{title}</h3>
        <div className="p-1.5 sm:p-2 bg-slate-50 rounded-lg shrink-0">{icon}</div>
      </div>
      <p className={`text-xl sm:text-2xl font-semibold tracking-tight ${colorClass} truncate`} title={isNumber ? value.toString() : formatCurrency(value)}>
        {isNumber ? value : formatCurrency(value)}
      </p>
    </div>
  );
}
