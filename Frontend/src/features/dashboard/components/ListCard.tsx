import React from 'react';
import { FaBed } from "react-icons/fa";

export const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    confirmed:   { label: "Đã xác nhận",  cls: "bg-blue-50 text-blue-700 border-blue-200" },
    checked_in:  { label: "Đã check-in",  cls: "bg-green-50 text-green-700 border-green-200" },
    checked_out: { label: "Đã trả phòng", cls: "bg-gray-100 text-gray-600 border-gray-200" },
    pending:     { label: "Chờ xác nhận", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    cancelled:   { label: "Đã hủy",       cls: "bg-red-50 text-red-600 border-red-200" },
  };
  const { label, cls } = map[status] ?? { label: status, cls: "bg-gray-100 text-gray-600 border-gray-200" };
  return <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cls}`}>{label}</span>;
};

export const ListCard = ({ title, icon, accent, count, children }: {
  title: string; icon: React.ReactNode; accent: string; count: number; children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col">
    <div className="flex items-center gap-2 mb-4">
      <span className={`text-lg ${accent}`}>{icon}</span>
      <h2 className="font-bold text-gray-800 text-sm flex-1">{title}</h2>
      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">{count}</span>
    </div>
    <div className="overflow-y-auto max-h-64 flex flex-col gap-0">{children}</div>
  </div>
);

export const EmptyRow = ({ label }: { label: string }) => (
  <div className="flex flex-col items-center justify-center py-10 text-gray-300 gap-2">
    <FaBed className="text-3xl" />
    <p className="text-sm">{label}</p>
  </div>
);
