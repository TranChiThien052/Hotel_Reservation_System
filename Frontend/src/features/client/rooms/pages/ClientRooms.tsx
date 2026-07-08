import { useCallback, useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import Room, { type RoomItem } from "@/app/layout/components/client/room";
import { roomsApi } from "@/features/admin/adminRooms/api/rooms-api";
import { roomTypesApi } from "@/features/admin/adminRoomTypes/api/roomTypes-api";
import { roomPricesApi } from "@/features/admin/adminRoomsPrices/api/roomPrices-api";

const ROOM_TYPES = ["Tất cả", "Standard", "Superior", "Deluxe", "Premium", "Suite"];
const GUEST_OPTIONS = ["Tất cả", "1", "2", "3", "4+"];
const PRICE_RANGES = [
  { label: "Tất cả", min: 0, max: Infinity },
  { label: "Dưới 1 triệu", min: 0, max: 1_000_000 },
  { label: "1 - 2 triệu", min: 1_000_000, max: 2_000_000 },
  { label: "2 - 3 triệu", min: 2_000_000, max: 3_000_000 },
  { label: "Trên 3 triệu", min: 3_000_000, max: Infinity },
];

const ClientRooms = () => {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [selectedGuests, setSelectedGuests] = useState("Tất cả");
  const [selectedPrice, setSelectedPrice] = useState(0);

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi song song 3 API
      const [roomsData, roomTypesData, roomPricesData] = await Promise.all([
        roomsApi.getAllRooms(),
        roomTypesApi.getRoomTypes(),
        roomPricesApi.getAllRoomprices(),
      ]);

      const roomsList: any[] = Array.isArray(roomsData) ? roomsData : [];
      const roomTypesList: any[] = Array.isArray(roomTypesData) ? roomTypesData : [];
      const roomPricesList: any[] = Array.isArray(roomPricesData) ? roomPricesData : [];

      // Tạo map: room_type_id -> roomType (có ảnh)
      const roomTypeMap = new Map<string, any>(
        roomTypesList.map((rt) => [rt.id, rt])
      );

      // Join: gắn thông tin roomImages từ room-types vào room_types của mỗi room
      const merged: RoomItem[] = roomsList.map((room: any) => {
        const rtFromApi = room.room_types ?? {};
        const rtFull = roomTypeMap.get(room.room_type_id) ?? rtFromApi;
        return {
          ...room,
          room_types: {
            ...rtFromApi,
            roomImages: rtFull.roomImages ?? [],
          },
          room_price: roomPricesList.find((rp) => rp.room_type_id === room.room_type_id) ?? null,
        };
      });

      setRooms(merged);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu phòng:", error);
    } finally {
      setLoading(false);
    }
  }, []);
  console.log("rooms", rooms);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleReset = () => {
    setSearch("");
    setSelectedType("Tất cả");
    setSelectedGuests("Tất cả");
    setSelectedPrice(0);
  };

  const filteredRooms = rooms.filter((room) => {
    const rt = room.room_types;
    if (!rt) return false;

    // Search filter
    if (search && !rt.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }

    // Room type filter
    if (selectedType !== "Tất cả") {
      if (!rt.name.toLowerCase().includes(selectedType.toLowerCase())) return false;
    }

    // Guest filter
    if (selectedGuests !== "Tất cả") {
      const guests = rt.max_guests ?? 0;
      if (selectedGuests === "4+") {
        if (guests < 4) return false;
      } else {
        if (guests !== parseInt(selectedGuests)) return false;
      }
    }

    // Price filter: dùng price_per_day từ room_price 
    if (selectedPrice !== 0) {
      const pricePerDay = room.room_price?.price_per_day
        ? Number(room.room_price.price_per_day)
        : undefined;
      if (pricePerDay !== undefined) {
        const priceRange = PRICE_RANGES[selectedPrice];
        if (pricePerDay < priceRange.min || pricePerDay >= priceRange.max) {
          return false;
        }
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
                  placeholder="Tên phòng hoặc loại..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
                />
              </div>
            </div>

            {/* Room Type */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Loại phòng</p>
              <div className="flex flex-col gap-2">
                {ROOM_TYPES.map((type) => (
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
              <p className="text-sm font-semibold text-gray-700 mb-2">Số khách</p>
              <select
                value={selectedGuests}
                onChange={(e) => setSelectedGuests(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
              >
                {GUEST_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
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
          {/* Result count */}
          <p className="text-gray-600 mb-5 font-medium">
            Hiển thị{" "}
            <span className="font-bold text-gray-800">{filteredRooms.length}</span>{" "}
            phòng
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

          {/* Room grid */}
          {!loading && filteredRooms.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredRooms.map((room) => (
                <div key={room.id}>
                  <Room room={room} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredRooms.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <svg
                className="w-20 h-20 mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 10h18M3 14h18M9 3v18M15 3v18"
                />
              </svg>
              <p className="text-lg font-semibold">Không tìm thấy phòng phù hợp</p>
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