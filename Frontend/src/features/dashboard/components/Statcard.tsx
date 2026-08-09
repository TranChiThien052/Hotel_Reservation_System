import React from 'react';

export const StatCard = ({ icon, label, value, sub, color, bg }: {
  icon: React.ReactNode; label: string; value: number | string;
  sub?: string; color: string; bg: string;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
    <div className={`${bg} ${color} rounded-xl p-3 text-2xl shrink-0`}>{icon}</div>
    <div>
      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-800 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);