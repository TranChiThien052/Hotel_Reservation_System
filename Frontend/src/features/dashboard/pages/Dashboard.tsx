import { useCallback, useEffect, useState } from "react";
import {
  FaBed,
  FaCheckCircle,
  FaHotel,
  FaSignInAlt,
  FaSignOutAlt,
  FaUsers,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { ListCard, EmptyRow, StatusBadge } from "../components/ListCard";
import { StatCard } from "../components/Statcard";
import { useAppSelector } from "@/app/store/hooks";
import { roomsApi } from "@/features/admin/adminRooms/api/rooms-api";
import type { Room } from "@/features/admin/adminRooms/types/rooms-type";
import { bookingApi } from "@/features/staff/staffBooking/api/booking-api";
import type { Booking } from "@/features/staff/staffBooking/types/booking-type";
import { FcCancel } from "react-icons/fc";
import type { CancellationRequestType } from "@/features/manager/managerCancellationRequest/types/cancellationRequest-type";

export interface BookingToday {
  bookings: Booking[];
  count: number;
}

const isSameLocalDay = (dateStr: string, refDate: Date) => {
  const d = new Date(dateStr);
  return (
    d.getFullYear() === refDate.getFullYear() &&
    d.getMonth() === refDate.getMonth() &&
    d.getDate() === refDate.getDate()
  );
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};



const Dashboard = () => {
  const user = useAppSelector((state) => state.auth.user);
  const branchId = user?.branch_id ?? "";
  const branchName = user?.branches?.name ?? "Chi nhánh";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<BookingToday>({ bookings: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [todayCheckins, setTodayCheckins] = useState<Booking[]>([]);
  const [cancelledRequests, setCancelledRequests] = useState<CancellationRequestType[]>([]);

  const today = new Date();
  const todayStr = today.toLocaleDateString("vi-VN", {
    weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
  });

  const fetchAll = useCallback(async () => {
    if (!branchId) {
      return;
    }
    setLoading(true);
    try {
      const [roomData, bookingData] = await Promise.all([
        roomsApi.getRoomsByBranchId(branchId),
        bookingApi.getBookingToday(branchId),
        
      ]);
      console.log("Booking data fetched:", bookingData);
      setRooms(Array.isArray(roomData) ? roomData : []);
      setBookings(bookingData);
      setTodayCheckins(Array.isArray(bookingData.bookings) ? bookingData.bookings : []);
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  }, [branchId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Room stats ──
  const activeRooms = rooms.filter((r) => r.is_active);
  const totalRooms = activeRooms.length;
  const occupiedRooms = activeRooms.filter((r) => r.status === "occupied").length;
  const availableRooms = activeRooms.filter((r) => r.status === "available").length;

  // ── Booking stats ──

  const todayCheckouts = bookings.bookings.filter(
    (b) =>
      b.checkout_at &&
      isSameLocalDay(b.checkout_at, today) &&
      (b.status === "checked_in" || b.status === "checked_out"),
  );

  const inHouseGuests = bookings.bookings.filter((b) => b.status === "checked_in");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm">Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaHotel className="text-blue-500" /> Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {branchName} · {todayStr}
          </p>
        </div>
        <button 
          onClick={fetchAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-all cursor-pointer"
        >
          <FiRefreshCw /> Làm mới
          <span className="text-gray-400 text-xs">
            {lastRefresh.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </button>
      </div>

      {/* Section 1: Room status */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Tình trạng phòng hôm nay</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<FaHotel />} label="Tổng số phòng" value={totalRooms} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={<FaBed />} label="Đang ở" value={occupiedRooms} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={<FaCheckCircle />} label="Còn trống"value={availableRooms} color="text-green-600"  bg="bg-green-50" />
      </div>

      {/* Section 2: Booking stats */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Booking trong ngày</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<FaSignInAlt />}  label="Tổng booking hôm nay" value={bookings.count} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={<FcCancel />} label="Yêu cầu hủy" value={0} color="text-rose-600" bg="bg-rose-50" />
      </div>

      {/* Section 3: Detail lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Check-in list */}
        <ListCard title="Danh sách Check-in hôm nay" icon={<FaSignInAlt />} accent="text-emerald-500" count={todayCheckins.length}>
          {todayCheckins.length === 0 ? <EmptyRow label="Không có khách check-in hôm nay" /> : (
            todayCheckins.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{b.customers?.full_name ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{b.booking_code} · {b.room_types?.name ?? "—"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={b.status} />
                  <p className="text-xs text-gray-400 mt-1">{formatTime(b.checkin_at)}</p>
                </div>
              </div>
            ))
          )}
        </ListCard>

        {/* Check-out list */}
        <ListCard title="Danh sách Check-out hôm nay" icon={<FaSignOutAlt />} accent="text-rose-400" count={todayCheckouts.length}>
          {todayCheckouts.length === 0 ? <EmptyRow label="Không có khách check-out hôm nay" /> : (
            todayCheckouts.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{b.customers?.full_name ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{b.booking_code} · {b.room_types?.name ?? "—"}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={b.status} />
                  <p className="text-xs text-gray-400 mt-1">Trả lúc {b.checkout_at ? formatTime(b.checkout_at) : "?"}</p>
                </div>
              </div>
            ))
          )}
        </ListCard>

        {/* In-house guests */}
        <ListCard title="Khách đang lưu trú" icon={<FaUsers />} accent="text-indigo-500" count={inHouseGuests.length}>
          {inHouseGuests.length === 0 ? <EmptyRow label="Không có khách đang lưu trú" /> : (
            inHouseGuests.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{b.customers?.full_name ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate">{b.booking_code} · {b.room_types?.name ?? "—"}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-gray-400">
                  <p>Từ {formatDate(b.checkin_at)}</p>
                  <p>Đến {b.checkout_at ? formatDate(b.checkout_at) : "?"}</p>
                </div>
              </div>
            ))
          )}
        </ListCard>
      </div>
    </div>
  );
};

export default Dashboard;
