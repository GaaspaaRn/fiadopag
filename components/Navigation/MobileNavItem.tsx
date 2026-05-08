import React from 'react';

export function MobileNavItem({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${
        active ? 'text-emerald-600' : 'text-slate-500 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}
