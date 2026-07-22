import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { bookingApi } from '@/features/staff/staffBooking/api/booking-api';
import type { Booking } from '@/features/staff/staffBooking/types/booking-type';
import { FaRegCalendarAlt, FaRegUser, FaTag, FaChevronRight } from 'react-icons/fa';
import { MdOutlineHotel } from 'react-icons/md';
import { IoCheckmarkCircle, IoTimeOutline } from 'react-icons/io5';
import { HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';
import { BsDoorOpen, BsDoorClosed } from 'react-icons/bs';
import { getBookingAmounts } from '../components/RefundModal';

const formatVND = (n: number | string) =>
    Number(n).toLocaleString('vi-VN') + 'đ';

const formatDate = (str: string) => {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatDateTime = (str: string) => {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

type BookingStatus = 'all' | 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled';

const STATUS_CONFIG: Record<string, {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
}> = {
    pending: {
        label: 'Chờ xác nhận',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: <HiOutlineClock className="text-amber-500" />,
    },
    confirmed: {
        label: 'Đã xác nhận',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: <IoCheckmarkCircle className="text-blue-500" />,
    },
    checked_in: {
        label: 'Đã nhận phòng',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        icon: <BsDoorOpen className="text-emerald-500" />,
    },
    checked_out: {
        label: 'Đã trả phòng',
        color: 'text-purple-700',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        icon: <BsDoorClosed className="text-purple-500" />,
    },
    completed: {
        label: 'Hoàn thành',
        color: 'text-teal-700',
        bg: 'bg-teal-50',
        border: 'border-teal-200',
        icon: <IoCheckmarkCircle className="text-teal-500" />,
    },
    cancelled: {
        label: 'Đã hủy',
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: <HiOutlineXCircle className="text-red-500" />,
    },
};

const FILTER_TABS: { key: BookingStatus; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'checked_in', label: 'Đang lưu trú' },
    { key: 'checked_out', label: 'Đã trả phòng' },
    { key: 'completed', label: 'Hoàn thành' },
    { key: 'cancelled', label: 'Đã hủy' },
];

const PAGE_SIZE = 5;

const BookingHistory = () => {
    const navigate = useNavigate();
    const { user, initialized } = useAppSelector((state) => state.auth);
    const isLoggedIn = !!user;
    const customerId = user?.customers?.id ?? null;

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<BookingStatus>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchBookings = useCallback(async () => {
        if (!customerId) return;
        setLoading(true);
        try {
            const data = await bookingApi.getBookingsByCustomerId(customerId);
            const list: Booking[] = Array.isArray(data) ? data : [];
            list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setBookings(list);
        } catch (err) {
            console.error('Lỗi khi lấy lịch sử đặt phòng:', err);
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    useEffect(() => {
        if (initialized && customerId) {
            fetchBookings();
        } else if (initialized) {
            setLoading(false);
        }
    }, [initialized, customerId, fetchBookings]);

    const filtered = activeFilter === 'all'
        ? bookings
        : bookings.filter((b) => b.status === activeFilter);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const handleFilterChange = (key: BookingStatus) => {
        setActiveFilter(key);
        setCurrentPage(1);
    };

    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-[80vh] bg-linear-to-br from-amber-50 to-orange-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center flex flex-col items-center gap-6">
                    <div className="w-24 h-24 bg-linear-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <FaRegCalendarAlt className="text-white text-4xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lịch sử đặt phòng</h1>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Bạn cần <span className="font-semibold text-amber-600">đăng nhập</span> để xem lịch sử đặt phòng.<br />
                            Theo dõi tất cả các đơn đặt phòng của bạn ở một nơi.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={() => navigate('/login?returnUrl=/my-bookings')}
                            className="w-full bg-linear-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
                        >
                            Đăng nhập ngay
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-400 hover:text-gray-600 underline transition-colors cursor-pointer"
                        >
                            Quay lại trang chủ
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <FaRegCalendarAlt className="text-amber-500" />
                        Lịch sử đặt phòng
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Xem và quản lý tất cả đơn đặt phòng của bạn
                    </p>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                    {FILTER_TABS.map((tab) => {
                        const count = tab.key === 'all'
                            ? bookings.length
                            : bookings.filter((b) => b.status === tab.key).length;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => handleFilterChange(tab.key)}
                                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all cursor-pointer ${
                                    activeFilter === tab.key
                                        ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-amber-300 hover:text-amber-600'
                                }`}
                            >
                                {tab.label}
                                {count > 0 && (
                                    <span className={`ml-1.5 text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                        activeFilter === tab.key ? 'bg-white/30 text-white' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-20">
                        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm">Đang tải lịch sử đặt phòng...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-4 py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                            <MdOutlineHotel className="text-gray-300 text-5xl" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-gray-600 text-lg">
                                {activeFilter === 'all' ? 'Chưa có đơn đặt phòng nào' : 'Không có đơn nào ở trạng thái này'}
                            </p>
                            <p className="text-gray-400 text-sm mt-1">
                                {activeFilter === 'all'
                                    ? 'Khám phá các phòng nghỉ của chúng tôi và đặt phòng ngay!'
                                    : 'Thử chọn bộ lọc khác để xem các đơn hàng'}
                            </p>
                        </div>
                        {activeFilter === 'all' && (
                            <button
                                onClick={() => navigate('/rooms')}
                                className="mt-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
                            >
                                Xem phòng nghỉ
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {paginated.map((booking) => {
                            const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
                            const isHourly = booking.booking_type === 'hourly';
                            const amounts = getBookingAmounts(booking);
                            return (
                                <div
                                    key={booking.id}
                                    onClick={() => navigate(`/my-bookings/${booking.id}`)}
                                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
                                >
                                    <div className="p-5">
                                        {/* Top row: code + status */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-xs text-gray-400 font-medium">Mã đặt phòng</span>
                                                <p className="font-bold text-gray-900 text-base tracking-wider">
                                                    #{booking.booking_code}
                                                </p>
                                            </div>
                                            <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                                                {statusCfg.icon}
                                                {statusCfg.label}
                                            </span>
                                        </div>

                                        {/* Middle row */}
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                                            <div className="flex items-start gap-2">
                                                <MdOutlineHotel className="text-amber-400 text-lg mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-400">Loại phòng</p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {booking.room_types?.name ?? '—'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <FaRegCalendarAlt className="text-amber-400 text-base mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-400">
                                                        {isHourly ? 'Thời gian' : 'Nhận phòng'}
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {isHourly ? formatDateTime(booking.checkin_at) : formatDate(booking.checkin_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            {!isHourly && (
                                                <div className="flex items-start gap-2">
                                                    <IoTimeOutline className="text-amber-400 text-lg mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-xs text-gray-400">Trả phòng</p>
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {formatDate(booking.checkout_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-2">
                                                <FaRegUser className="text-amber-400 text-base mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-400">Số khách</p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {booking.num_guests} người
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-2">
                                                <FaTag className="text-amber-400 text-base mt-0.5 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-400">Loại đặt</p>
                                                    <p className="text-sm font-semibold text-gray-800">
                                                        {isHourly ? 'Theo giờ' : 'Theo ngày'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-3 border-t border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">Tổng tiền</span>
                                                <span className="text-sm font-bold text-gray-900">
                                                    {formatVND(amounts.totalAmount)}
                                                </span>
                                            </div>
                                            {amounts.isFullPaid ? (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-emerald-600 font-semibold">Đã thanh toán đủ</span>
                                                    <span className="text-sm font-bold text-emerald-600">
                                                        {formatVND(amounts.paidAmount)}
                                                    </span>
                                                </div>
                                            ) : amounts.isDepositPaid ? (
                                                <>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Đã cọc</span>
                                                        <span className="text-sm font-bold text-blue-600">
                                                            {formatVND(amounts.paidAmount)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Còn lại</span>
                                                        <span className="text-lg font-bold text-amber-500">
                                                            {formatVND(amounts.remainingAmount)}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500">Còn lại</span>
                                                    <span className="text-lg font-bold text-amber-500">
                                                        {formatVND(amounts.totalAmount)}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex justify-end mt-1 group-hover:mt-2 transition-all">
                                                <div className="flex items-center gap-1 text-amber-500 group-hover:gap-2 transition-all">
                                                    <span className="text-sm font-medium">Xem chi tiết</span>
                                                    <FaChevronRight className="text-xs" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* ── Phân trang ── */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4">
                                <p className="text-sm text-gray-500">
                                    Hiển thị{' '}
                                    <span className="font-semibold text-gray-700">{(currentPage - 1) * PAGE_SIZE + 1}</span>
                                    –
                                    <span className="font-semibold text-gray-700">{Math.min(currentPage * PAGE_SIZE, filtered.length)}</span>
                                    {' '}/ <span className="font-semibold text-gray-700">{filtered.length}</span> đơn
                                </p>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        ‹
                                    </button>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                                                page === currentPage
                                                    ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                                                    : 'border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:border-amber-400 hover:text-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingHistory;
