import {
  FaBed,
  FaCheckCircle,
  FaHotel,
  FaSignInAlt,
  FaSignOutAlt,
  FaTools,
  FaUsers,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { ListCard, EmptyRow, StatusBadge } from "../components/ListCard";
import { StatCard, OccupancyRing } from "../components/Statcard";

// ── Mock data – thay bằng state từ API ────────────────────────────────────────
const ROOM_STATS = { total: 32, occupied: 18, available: 11, maintenance: 3 };
const CHECKIN_STATS = { total: 8, arrived: 5, pending: 3 };
const CHECKOUT_STATS = { total: 6 };
const IN_HOUSE = { total: 18 };

const TODAY_CHECKINS = [
  { id: "1", name: "Nguyễn Văn An", code: "BK001A2B", room: "Deluxe", time: "14:00", status: "confirmed" },
  { id: "2", name: "Trần Thị Bích", code: "BK002C3D", room: "Standard", time: "15:30", status: "checked_in" },
  { id: "3", name: "Lê Minh Cường", code: "BK003E4F", room: "Suite", time: "16:00", status: "confirmed" },
  { id: "4", name: "Phạm Thị Dung", code: "BK004G5H", room: "Deluxe", time: "12:00", status: "checked_in" },
];

const TODAY_CHECKOUTS = [
  { id: "5", name: "Hoàng Văn Em", code: "BK005I6J", room: "Standard", checkoutAt: "12:00", status: "checked_out" },
  { id: "6", name: "Vũ Thị Phương", code: "BK006K7L", room: "Deluxe", checkoutAt: "11:00", status: "checked_in" },
  { id: "7", name: "Đỗ Minh Quân", code: "BK007M8N", room: "Suite", checkoutAt: "10:30", status: "checked_out" },
];

const IN_HOUSE_LIST = [
  { id: "8", name: "Bùi Văn Sơn", code: "BK008O9P", room: "Deluxe", checkin: "18/07/2026", checkout: "21/07/2026" },
  { id: "9", name: "Ngô Thị Tuyết", code: "BK009Q0R", room: "Suite", checkin: "17/07/2026", checkout: "22/07/2026" },
  { id: "10", name: "Đinh Văn Uy", code: "BK010S1T", room: "Standard", checkin: "19/07/2026", checkout: "20/07/2026" },
  { id: "11", name: "Phan Thị Vân", code: "BK011U2V", room: "Deluxe", checkin: "15/07/2026", checkout: "25/07/2026" },
];
// ─────────────────────────────────────────────────────────────────────────────

const today = new Date();
const todayStr = today.toLocaleDateString("vi-VN", {
  weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
});
const occupancyPct = Math.round((ROOM_STATS.occupied / ROOM_STATS.total) * 100);

// ── Sub-components moved to components/ ─────────────────────────────────────────

// ── Dashboard ─────────────────────────────────────────────────────────────────

const Dashboard = () => {
  // TODO: thay bằng state thực từ API
  // const [rooms, setRooms] = useState([]);
  // const [todayCheckins, setTodayCheckins] = useState([]);
  // ...

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaHotel className="text-blue-500" /> Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Chi nhánh Quận 1 · {todayStr}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-all cursor-pointer">
          <FiRefreshCw /> Làm mới
          <span className="text-gray-400 text-xs">
            {today.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </button>
      </div>

      {/* Section 1: Room status */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Tình trạng phòng hôm nay</p>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={<FaHotel />}       label="Tổng số phòng"      value={ROOM_STATS.total}       color="text-blue-600"   bg="bg-blue-50" />
        <StatCard icon={<FaBed />}         label="Đã bán / In-house"  value={ROOM_STATS.occupied}    color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={<FaCheckCircle />} label="Còn trống"          value={ROOM_STATS.available}   color="text-green-600"  bg="bg-green-50" />
        <StatCard icon={<FaTools />}       label="Đang bảo trì"       value={ROOM_STATS.maintenance} color="text-orange-500" bg="bg-orange-50" />
      </div>

      {/* Section 2: Check-in / Check-out stats */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Check-in / Check-out trong ngày</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<FaSignInAlt />}  label="Check-in hôm nay"    value={CHECKIN_STATS.total}
          sub={`${CHECKIN_STATS.arrived} đã đến · ${CHECKIN_STATS.pending} chưa đến`}
          color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard icon={<FaSignOutAlt />} label="Check-out hôm nay"   value={CHECKOUT_STATS.total} color="text-rose-500"   bg="bg-rose-50" />
        <StatCard icon={<FaUsers />}      label="Khách đang lưu trú"  value={IN_HOUSE.total}       color="text-indigo-600" bg="bg-indigo-50" />
      </div>

      {/* Section 3: Detail lists */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Check-in list */}
        <ListCard title="Danh sách Check-in hôm nay" icon={<FaSignInAlt />} accent="text-emerald-500" count={TODAY_CHECKINS.length}>
          {TODAY_CHECKINS.length === 0 ? <EmptyRow label="Không có khách check-in hôm nay" /> : (
            TODAY_CHECKINS.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{b.name}</p>
                  <p className="text-xs text-gray-400 truncate">{b.code} · {b.room}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={b.status} />
                  <p className="text-xs text-gray-400 mt-1">{b.time}</p>
                </div>
              </div>
            ))
          )}
        </ListCard>

        {/* Check-out list */}
        <ListCard title="Danh sách Check-out hôm nay" icon={<FaSignOutAlt />} accent="text-rose-400" count={TODAY_CHECKOUTS.length}>
          {TODAY_CHECKOUTS.length === 0 ? <EmptyRow label="Không có khách check-out hôm nay" /> : (
            TODAY_CHECKOUTS.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{b.name}</p>
                  <p className="text-xs text-gray-400 truncate">{b.code} · {b.room}</p>
                </div>
                <div className="shrink-0 text-right">
                  <StatusBadge status={b.status} />
                  <p className="text-xs text-gray-400 mt-1">Trả lúc {b.checkoutAt}</p>
                </div>
              </div>
            ))
          )}
        </ListCard>

        {/* In-house guests */}
        <ListCard title="Khách đang lưu trú" icon={<FaUsers />} accent="text-indigo-500" count={IN_HOUSE_LIST.length}>
          {IN_HOUSE_LIST.length === 0 ? <EmptyRow label="Không có khách đang lưu trú" /> : (
            IN_HOUSE_LIST.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-gray-800 truncate">{b.name}</p>
                  <p className="text-xs text-gray-400 truncate">{b.code} · {b.room}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-gray-400">
                  <p>Từ {b.checkin}</p>
                  <p>Đến {b.checkout}</p>
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
