import { useEffect, useState } from "react";
import { TfiMoney } from "react-icons/tfi";
import apiClient from "@/shared/lib/axios";

type ViewMode = "month" | "quarter" | "year";

const QUARTER_LABELS = ["Quý 1", "Quý 2", "Quý 3", "Quý 4"];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount ?? 0);

interface RevenueCardProps {
  branchId: string;
}

export const RevenueCard = ({ branchId }: RevenueCardProps) => {
  const now = new Date();
  const [mode, setMode] = useState<ViewMode>("month");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [quarter, setQuarter] = useState(Math.ceil((now.getMonth() + 1) / 3));
  const [year, setYear] = useState(now.getFullYear());
  const [revenue, setRevenue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const currentYear = now.getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    if (!branchId) return;
    const fetchRevenue = async () => {
      setLoading(true);
      setError(false);
      try {
        const params: Record<string, string | number> = {
          get_by: mode,
          year,
          branch_id: branchId,
        };
        if (mode === "month") params.month = month;
        if (mode === "quarter") params.quarter = quarter;

        const res = await apiClient.get("/payments/report", { params });
        const data = res.data;
        console.log("Data",data);
        
        if (mode === "year") {
          setRevenue(data?.total ?? 0);
        } else {
          setRevenue(data?.total?.total ?? 0);
        }
      } catch {
        setError(true);
        setRevenue(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [branchId, mode, month, quarter, year]);

  const periodLabel = () => {
    if (mode === "month") return `Tháng ${month}/${year}`;
    if (mode === "quarter") return `${QUARTER_LABELS[quarter - 1]}/${year}`;
    return `Năm ${year}`;
  };

  const tabs: { key: ViewMode; label: string }[] = [
    { key: "month", label: "Tháng" },
    { key: "quarter", label: "Quý" },
    { key: "year", label: "Năm" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-green-50 text-green-600 rounded-xl p-2 text-lg">
          <TfiMoney />
        </div>
        <p className="text-sm font-semibold text-gray-700">Doanh thu</p>
      </div>

      
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMode(tab.key)}
            className={`flex-1 text-xs py-1.5 rounded-md font-medium transition-all cursor-pointer ${
              mode === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      
      <div className="flex gap-2 mb-4">
        {mode === "month" && (
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>Tháng {m}</option>
            ))}
          </select>
        )}

        {mode === "quarter" && (
          <select
            value={quarter}
            onChange={(e) => setQuarter(Number(e.target.value))}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
          >
            {[1, 2, 3, 4].map((q) => (
              <option key={q} value={q}>{QUARTER_LABELS[q - 1]}</option>
            ))}
          </select>
        )}

        
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      
      <div className="text-center py-3">
        <p className="text-xs text-gray-400 mb-1">{periodLabel()}</p>
        {loading ? (
          <div className="flex justify-center py-2">
            <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <p className="text-sm text-red-400">Không thể tải dữ liệu</p>
        ) : (
          <p className="text-2xl font-bold text-green-600">{formatCurrency(revenue ?? 0)}</p>
        )}
      </div>
    </div>
  );
};
