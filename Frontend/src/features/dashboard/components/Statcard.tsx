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

export const OccupancyRing = ({ pct }: { pct: number }) => {
  const r = 38, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 80 ? "#ef4444" : pct >= 50 ? "#f59e0b" : "#22c55e";
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
        <circle cx="48" cy="48" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
          strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
        <text x="48" y="53" textAnchor="middle" fontSize="16" fontWeight="700" fill="#1f2937">{pct}%</text>
      </svg>
      <p className="text-xs text-gray-500 font-medium">Tỷ lệ lấp đầy</p>
    </div>
  );
};
