import React from 'react';

export interface StatItemProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export const StatItem: React.FC<StatItemProps> = ({ label, value, subtext, icon: Icon, colorClass }) => (
  <div className="flex items-center gap-3 p-2.5">
    <div className={`p-2 rounded-xl ${colorClass} bg-opacity-10 shrink-0`}>
      <Icon className={`w-5 h-5 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-500 truncate">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {subtext && <span className="text-[10px] text-slate-400 font-medium truncate">{subtext}</span>}
      </div>
    </div>
  </div>
);
