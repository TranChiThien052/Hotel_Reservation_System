import { useCallback, useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { roomTypesApi } from "@/features/admin/adminRoomTypes/api/roomTypes-api";
import { roomPricesApi } from "@/features/admin/adminRoomsPrices/api/roomPrices-api";
import Room, { type RoomTypeWithPrice } from "@/app/layout/components/client/room";
import { branchApi } from "@/features/admin/adminBranch/api/admin-api";
import type { Branch } from "@/features/admin/adminBranch/types/branch-type";

// ── Constants ────────────────────────────────────────────────────────────────
const GUEST_OPTIONS = ["Tất cả", "1", "2", "3", "4+"];
const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 1 triệu", min: 0, max: 1_000_000 },
  { label: "1 - 2 triệu", min: 1_000_000, max: 2_000_000 },
  { label: "2 - 3 triệu", min: 2_000_000, max: 3_000_000 },
  { label: "Trên 3 triệu", min: 3_000_000, max: Infinity },
];




const ClientRooms = () => {
  const [roomTypes, setRoomTypes] = useState<RoomTypeWithPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const [roomTypeNames, setRoomTypeNames] = useState<string[]>([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [selectedBranch, setSelectedBranch] = useState("Tất cả");
  const [selectedGuests, setSelectedGuests] = useState("Tất cả");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [branchData, setBranchData] = useState<Branch[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rtData, rpData, branchData] = await Promise.all([
        roomTypesApi.getRoomTypes(),
        roomPricesApi.getAllRoomprices(),
        branchApi.getBranches(),
      ]);

      const rtList: any[] = Array.isArray(rtData) ? rtData : [];
      const rpList: any[] = Array.isArray(rpData) ? rpData : [];
      const branchList: Branch[] = Array.isArray(branchData) ? branchData : [];
      setBranchData(branchList);

      // Lấy danh sách tên loại phòng duy nhất để làm filter
      const uniqueNames = ["Tất cả", ...Array.from(new Set<string>(rtList.map((rt) => rt.name)))];
      setRoomTypeNames(uniqueNames);

      // Join giá vào từng room type
      const merged: RoomTypeWithPrice[] = rtList
        .filter((rt) => rt.is_active !== false)
        .map((rt) => ({
          ...rt,
          room_price: rpList.find((rp) => rp.room_type_id === rt.id) ?? null,
        }));

      setRoomTypes(merged);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu loại phòng:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log("roomTypes:", roomTypes);

  const handleReset = () => {
    setSearch("");
    setSelectedType("Tất cả");
    setSelectedBranch("Tất cả");
    setSelectedGuests("Tất cả");
    setSelectedPrice(0);
  };

  
  const filtered = roomTypes.filter((rt) => {
    // Search
    if (search && !rt.name.toLowerCase().includes(search.toLowerCase())) return false;

    // Branch
    if (selectedBranch !== "Tất cả" && rt.branches?.name !== selectedBranch) return false;

    // Type
    if (selectedType !== "Tất cả" && rt.name !== selectedType) return false;

    // Guests
    if (selectedGuests !== "Tất cả") {
      const g = rt.max_guests ?? 0;
      if (selectedGuests === "4+") {
        if (g < 4) return false;
      } else {
        if (g !== parseInt(selectedGuests)) return false;
      }
    }

    // Price
    if (selectedPrice !== 0) {
      const price = rt.room_price?.price_per_day
        ? Number(rt.room_price.price_per_day)
        : undefined;
      if (price !== undefined) {
        const range = PRICE_RANGES[selectedPrice];
        if (price < range.min || price >= range.max) return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">

        {/* ── Sidebar Filter ── */}
        <aside className="w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold text-gray-800">Bộ lọc</span>
              <button
                onClick={handleReset}
                className="text-orange-400 font-medium text-sm hover:text-orange-600 hover:underline transition-colors cursor-pointer"
              >
                Đặt lại
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Tìm kiếm</p>
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tên loại phòng..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
                />
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Chi nhánh</p>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
              >
                <option value="Tất cả">Tất cả</option>
                {branchData?.map((branch) => (
                  <option key={branch.id} value={branch.name}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Loại phòng</p>
              <div className="flex flex-col gap-2">
                {roomTypeNames.map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    <input
                      type="radio"
                      name="room-type"
                      checked={selectedType === type}
                      onChange={() => setSelectedType(type)}
                      className="accent-orange-500 w-4 h-4"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            {/* Guests */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Số khách tối đa</p>
              <select
                value={selectedGuests}
                onChange={(e) => setSelectedGuests(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
              >
                {GUEST_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Khoảng giá / đêm</p>
              <div className="flex flex-col gap-2">
                {PRICE_RANGES.map((range, idx) => (
                  <label
                    key={range.label}
                    className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-orange-500 transition-colors"
                  >
                    <input
                      type="radio"
                      name="price-range"
                      checked={selectedPrice === idx}
                      onChange={() => setSelectedPrice(idx)}
                      className="accent-orange-500 w-4 h-4"
                    />
                    {range.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">
          <p className="text-gray-600 mb-5 font-medium">
            Hiển thị{" "}
            <span className="font-bold text-gray-800">{filtered.length}</span>{" "}
            loại phòng
          </p>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-white border border-gray-200 h-96 animate-pulse"
                >
                  <div className="h-3/5 bg-gray-200 rounded-t-xl" />
                  <div className="p-5 flex flex-col gap-3">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-5 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filtered.map((rt) => (
                <Room key={rt.id} room={rt} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <svg className="w-20 h-20 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M9 3v18M15 3v18" />
              </svg>
              <p className="text-lg font-semibold">Không tìm thấy loại phòng phù hợp</p>
              <p className="text-sm mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              <button
                onClick={handleReset}
                className="mt-4 px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientRooms;