import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { bookingApi } from '@/features/staff/staffBooking/api/booking-api';
import type { Booking } from '@/features/staff/staffBooking/types/booking-type';
import { cancellationApi } from '@/features/client/profile/api/profile-api';
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import {
    FaRegCalendarAlt, FaRegUser, FaTag, FaBuilding,
} from 'react-icons/fa';
import {
    MdOutlineHotel, MdOutlinePhone, MdOutlineMail,
    MdOutlineCreditCard, MdOutlineNotes, MdOutlineMoneyOffCsred,
} from 'react-icons/md';
import { HiOutlineClock, HiOutlineXCircle } from 'react-icons/hi';
import { BsDoorOpen, BsDoorClosed, BsReceipt } from 'react-icons/bs';
import RefundModal, { calcRefund } from './RefundModal';


const formatVND = (n: number | string) =>
    Number(n).toLocaleString('vi-VN') + 'đ';

const formatDate = (str?: string | null) => {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
    });
};

const formatDateTime = (str?: string | null) => {
    if (!str) return '—';
    return new Date(str).toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};


const STATUS_CONFIG: Record<string, {
    label: string; color: string; bg: string; border: string; icon: React.ReactNode;
}> = {
    pending: {
        label: 'Chờ xác nhận', color: 'text-amber-700', bg: 'bg-amber-50',
        border: 'border-amber-200', icon: <HiOutlineClock className="text-amber-500 text-lg" />,
    },
    confirmed: {
        label: 'Đã xác nhận', color: 'text-blue-700', bg: 'bg-blue-50',
        border: 'border-blue-200', icon: <IoCheckmarkCircle className="text-blue-500 text-lg" />,
    },
    checked_in: {
        label: 'Đã nhận phòng', color: 'text-emerald-700', bg: 'bg-emerald-50',
        border: 'border-emerald-200', icon: <BsDoorOpen className="text-emerald-500 text-lg" />,
    },
    checked_out: {
        label: 'Đã trả phòng', color: 'text-purple-700', bg: 'bg-purple-50',
        border: 'border-purple-200', icon: <BsDoorClosed className="text-purple-500 text-lg" />,
    },
    completed: {
        label: 'Hoàn thành', color: 'text-teal-700', bg: 'bg-teal-50',
        border: 'border-teal-200', icon: <IoCheckmarkCircle className="text-teal-500 text-lg" />,
    },
    cancelled: {
        label: 'Đã hủy', color: 'text-red-700', bg: 'bg-red-50',
        border: 'border-red-200', icon: <HiOutlineXCircle className="text-red-500 text-lg" />,
    },
};


const CANCEL_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Đang chờ xử lý', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300' },
    confirmed: { label: 'Đã chấp thuận', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-300' },
    failed: { label: 'Bị từ chối', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300' },
};


const InfoRow = ({ label, value, icon }: {
    label: string; value: React.ReactNode; icon?: React.ReactNode;
}) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
        {icon && <span className="text-amber-400 text-base mt-0.5 shrink-0">{icon}</span>}
        <div className="flex-1 flex justify-between items-start gap-4">
            <span className="text-sm text-gray-500 shrink-0">{label}</span>
            <span className="text-sm font-semibold text-gray-800 text-right">{value}</span>
        </div>
    </div>
);


const BookingDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, initialized } = useAppSelector((state) => state.auth);

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /* Hoàn tiền */
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundSubmitting, setRefundSubmitting] = useState(false);
    const [refundSuccess, setRefundSuccess] = useState(false);
    const [refundError, setRefundError] = useState('');
    const [existingCancelRequest, setExistingCancelRequest] = useState<any>(null);

    const fetchBooking = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await bookingApi.getBookingById(id);
            setBooking(data);

            // Kiểm tra xem đã có yêu cầu hoàn tiền chưa
            try {
                const cancelRequests = await cancellationApi.getByBookingId(id);
                if (cancelRequests.length > 0) {
                    setExistingCancelRequest(cancelRequests[0]);
                }
            } catch {
                // Bỏ qua lỗi fetch cancellation
            }
        } catch (err) {
            console.error('Lỗi khi lấy chi tiết đặt phòng:', err);
            setError('Không thể tải thông tin đặt phòng.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (initialized) fetchBooking();
    }, [initialized, fetchBooking]);

    const handleRefundConfirm = async (reason: string, refundAmount: number) => {
        if (!booking || !id) return;
        setRefundSubmitting(true);
        setRefundError('');
        try {
            await cancellationApi.createCancellationRequest({
                booking_id: id,
                requested_by: user?.id,
                reason,
                refund_amount: refundAmount,
                notes: `Yêu cầu hoàn tiền từ khách hàng. Số tiền hoàn dự kiến: ${formatVND(refundAmount)}`,
            });
            setRefundSuccess(true);
            setShowRefundModal(false);
            // Reload để lấy trạng thái mới nhất
            fetchBooking();
        } catch (err: any) {
            setRefundError(err?.response?.data?.error ?? 'Gửi yêu cầu thất bại. Vui lòng thử lại.');
        } finally {
            setRefundSubmitting(false);
        }
    };

    /* ─── Loading / error states ─────────────────────────── */
    if (!initialized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
                    <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                        <FaRegUser className="text-amber-500 text-4xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Yêu cầu đăng nhập</h1>
                    <p className="text-gray-500 text-sm">Bạn cần đăng nhập để xem chi tiết đặt phòng.</p>
                    <button
                        onClick={() => navigate(`/login?returnUrl=/my-bookings/${id}`)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-400 text-sm">Đang tải chi tiết đặt phòng...</p>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-xl font-bold text-gray-700 mb-2">{error || 'Không tìm thấy đơn đặt phòng'}</p>
                    <button onClick={() => navigate('/my-bookings')} className="mt-4 text-amber-600 underline cursor-pointer">
                        Quay lại lịch sử đặt phòng
                    </button>
                </div>
            </div>
        );
    }

    /* ─── Computed values ─────────────────────────────────── */
    const statusCfg = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending;
    const isHourly = booking.booking_type === 'hourly';
    const customer = booking.customers;
    const hasDiscount = Number(booking.discount_amount ?? 0) > 0;

    const checkinDate = new Date(booking.checkin_at);
    const checkoutDate = new Date(booking.checkout_at);
    const diffMs = checkoutDate.getTime() - checkinDate.getTime();
    const nights = isHourly ? 0 : Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const hours = isHourly ? Math.round(diffMs / (1000 * 60 * 60)) : 0;

    /* Điều kiện hiển thị nút hoàn tiền */
    const canRequestRefund =
        !isHourly &&
        (booking.status === 'pending' || booking.status === 'confirmed') &&
        !existingCancelRequest &&
        !refundSuccess;

    const refundInfo = booking ? calcRefund(booking) : null;

    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-6 group cursor-pointer"
                >
                    <IoArrowBack className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Quay lại lịch sử đặt phòng</span>
                </button>

                {/* Header card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <BsReceipt className="text-amber-500" />
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mã đặt phòng</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-wider">
                                #{booking.booking_code}
                            </h1>
                            <p className="text-xs text-gray-400 mt-1">
                                Đặt lúc: {formatDateTime(booking.created_at)}
                            </p>
                        </div>
                        <span className={`self-start sm:self-center flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border-2 ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                            {statusCfg.icon}
                            {statusCfg.label}
                        </span>
                    </div>
                </div>

                {/* Thông báo yêu cầu hoàn tiền đã gửi */}
                {(existingCancelRequest || refundSuccess) && (
                    <div className={`mb-5 p-4 rounded-2xl border-2 ${
                        existingCancelRequest?.status === 'confirmed'
                            ? 'bg-green-50 border-green-200'
                            : existingCancelRequest?.status === 'failed'
                                ? 'bg-red-50 border-red-200'
                                : 'bg-amber-50 border-amber-200'
                    }`}>
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                existingCancelRequest?.status === 'confirmed'
                                    ? 'bg-green-100'
                                    : existingCancelRequest?.status === 'failed'
                                        ? 'bg-red-100'
                                        : 'bg-amber-100'
                            }`}>
                                <MdOutlineMoneyOffCsred className={`text-xl ${
                                    existingCancelRequest?.status === 'confirmed'
                                        ? 'text-green-500'
                                        : existingCancelRequest?.status === 'failed'
                                            ? 'text-red-500'
                                            : 'text-amber-500'
                                }`} />
                            </div>
                            <div className="flex-1">
                                <p className={`font-bold text-sm ${
                                    existingCancelRequest?.status === 'confirmed'
                                        ? 'text-green-700'
                                        : existingCancelRequest?.status === 'failed'
                                            ? 'text-red-700'
                                            : 'text-amber-700'
                                }`}>
                                    Yêu cầu hoàn tiền
                                    {existingCancelRequest
                                        ? ` — ${CANCEL_STATUS_CONFIG[existingCancelRequest.status]?.label ?? ''}`
                                        : ' đã được gửi thành công'}
                                </p>
                                {existingCancelRequest && (
                                    <>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Lý do: {existingCancelRequest.reason}
                                        </p>
                                        {existingCancelRequest.refund_amount && (
                                            <p className="text-xs text-gray-500">
                                                Số tiền hoàn dự kiến: <strong>{formatVND(existingCancelRequest.refund_amount)}</strong>
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-400 mt-1">
                                            Gửi lúc: {formatDateTime(existingCancelRequest.created_at)}
                                        </p>
                                    </>
                                )}
                                {!existingCancelRequest && refundSuccess && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        Yêu cầu sẽ được quản lý chi nhánh xem xét trong thời gian sớm nhất.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Refund error */}
                {refundError && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                        {refundError}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Thông tin phòng */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <MdOutlineHotel className="text-amber-500 text-base" />
                            Thông tin phòng
                        </h2>
                        <div className="mt-3">
                            <InfoRow
                                label="Loại phòng"
                                value={booking.room_types?.name ?? '—'}
                                icon={<MdOutlineHotel />}
                            />
                            <InfoRow
                                label="Chi nhánh"
                                value={booking.branches?.name ?? '—'}
                                icon={<FaBuilding />}
                            />
                            <InfoRow
                                label="Loại đặt"
                                value={
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isHourly ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {isHourly ? 'Theo giờ' : 'Theo ngày'}
                                    </span>
                                }
                                icon={<FaTag />}
                            />
                            <InfoRow
                                label="Số khách"
                                value={`${booking.num_guests} người`}
                                icon={<FaRegUser />}
                            />
                        </div>
                    </div>

                    {/* Thời gian */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <FaRegCalendarAlt className="text-amber-500 text-base" />
                            Thời gian lưu trú
                        </h2>
                        <div className="mt-3">
                            <InfoRow
                                label={isHourly ? 'Bắt đầu' : 'Nhận phòng'}
                                value={isHourly ? formatDateTime(booking.checkin_at) : formatDate(booking.checkin_at)}
                                icon={<FaRegCalendarAlt />}
                            />
                            <InfoRow
                                label={isHourly ? 'Kết thúc' : 'Trả phòng'}
                                value={isHourly ? formatDateTime(booking.checkout_at) : formatDate(booking.checkout_at)}
                                icon={<FaRegCalendarAlt />}
                            />
                            <InfoRow
                                label="Thời lượng"
                                value={isHourly ? `${hours} giờ` : `${nights} đêm`}
                                icon={<HiOutlineClock />}
                            />
                            {booking.actual_checkin_at && (
                                <InfoRow
                                    label="Check-in thực tế"
                                    value={formatDateTime(booking.actual_checkin_at)}
                                    icon={<BsDoorOpen />}
                                />
                            )}
                            {booking.actual_checkout_at && (
                                <InfoRow
                                    label="Check-out thực tế"
                                    value={formatDateTime(booking.actual_checkout_at)}
                                    icon={<BsDoorClosed />}
                                />
                            )}
                        </div>
                    </div>

                    {/* Thông tin khách hàng */}
                    {customer && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                                <FaRegUser className="text-amber-500 text-base" />
                                Thông tin khách hàng
                            </h2>
                            <div className="mt-3">
                                <InfoRow label="Họ tên" value={customer.full_name} icon={<FaRegUser />} />
                                <InfoRow label="Điện thoại" value={customer.phone || '—'} icon={<MdOutlinePhone />} />
                                <InfoRow label="Email" value={customer.email || '—'} icon={<MdOutlineMail />} />
                                <InfoRow label="CCCD/Hộ chiếu" value={customer.id_card_number || '—'} icon={<MdOutlineCreditCard />} />
                                <InfoRow label="Quốc tịch" value={customer.nationality || '—'} />
                            </div>
                        </div>
                    )}

                    {/* Chi phí */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-2">
                            <BsReceipt className="text-amber-500 text-base" />
                            Chi phí
                        </h2>
                        <div className="mt-3">
                            <InfoRow
                                label="Giá phòng/đêm"
                                value={formatVND(booking.room_price_snapshot)}
                            />
                            <InfoRow
                                label="Tạm tính"
                                value={booking.subtotal ? formatVND(booking.subtotal) : '—'}
                            />
                            {hasDiscount && (
                                <InfoRow
                                    label="Giảm giá"
                                    value={
                                        <span className="text-green-600 font-bold">
                                            − {formatVND(booking.discount_amount ?? 0)}
                                        </span>
                                    }
                                    icon={<FaTag />}
                                />
                            )}
                            <div className="flex justify-between items-center py-3 mt-2 border-t-2 border-gray-100">
                                <span className="font-bold text-gray-900">Tổng cộng</span>
                                <span className={`font-bold text-lg ${Number(booking.deposit_amount ?? 0) > 0 ? 'text-gray-900' : 'text-amber-500'}`}>
                                    {booking.total_amount ? formatVND(booking.total_amount) : '—'}
                                </span>
                            </div>
                            {Number(booking.deposit_amount ?? 0) > 0 && (
                                <>
                                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-sm mb-3">
                                        <div className="flex justify-between">
                                            <span className="text-blue-600">Đã đặt cọc</span>
                                            <span className="text-blue-700 font-bold">{formatVND(booking.deposit_amount)}</span>
                                        </div>
                                        {booking.deposit_paid_at && (
                                            <p className="text-xs text-blue-400 mt-1">
                                                Thanh toán lúc: {formatDateTime(booking.deposit_paid_at)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-t-2 border-gray-100">
                                        <span className="font-bold text-gray-900">Còn lại cần thanh toán</span>
                                        <span className="font-bold text-xl text-amber-500">
                                            {booking.total_amount 
                                                ? formatVND(Number(booking.total_amount) - Number(booking.deposit_amount)) 
                                                : '—'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ghi chú */}
                {booking.notes && (
                    <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <MdOutlineNotes className="text-amber-500 text-base" />
                            Ghi chú
                        </h2>
                        <p className="text-sm text-gray-600 leading-relaxed">{booking.notes}</p>
                    </div>
                )}

                {/* Chính sách hoàn tiền preview (chỉ hiện khi chưa có yêu cầu) */}
                {canRequestRefund && refundInfo && (
                    <div className="mt-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <MdOutlineMoneyOffCsred className="text-red-400 text-base" />
                            Chính sách hoàn tiền
                        </h2>
                        <div className={`rounded-xl p-4 border ${refundInfo.isFullRefund
                            ? 'bg-green-50 border-green-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                            <p className={`text-sm font-medium ${refundInfo.isFullRefund ? 'text-green-700' : 'text-amber-700'}`}>
                                {refundInfo.isFullRefund
                                    ? '✅ Nếu hủy ngay bây giờ, bạn sẽ được hoàn 100%'
                                    : '⚠️ Nếu hủy ngay bây giờ, sẽ bị trừ phí 1 đêm đầu'}
                            </p>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-xs text-gray-500">Số tiền hoàn dự kiến:</span>
                                <span className={`font-bold ${refundInfo.isFullRefund ? 'text-green-600' : 'text-amber-600'}`}>
                                    {formatVND(refundInfo.amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex flex-wrap justify-between items-center gap-3">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        ← Quay lại
                    </button>

                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Thông báo trạng thái */}
                        {booking.status === 'pending' && !canRequestRefund && !existingCancelRequest && (
                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
                                ⏳ Đơn đang chờ xác nhận từ khách sạn
                            </p>
                        )}

                        {/* Nút yêu cầu hoàn tiền */}
                        {canRequestRefund && (
                            <button
                                onClick={() => setShowRefundModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm hover:shadow-md"
                            >
                                <MdOutlineMoneyOffCsred className="text-base" />
                                Yêu cầu hoàn tiền
                            </button>
                        )}

                        {/* Thông báo đơn theo giờ không được hoàn */}
                        {isHourly && (booking.status === 'pending' || booking.status === 'confirmed') && (
                            <p className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-4 py-2.5 rounded-xl">
                                🕐 Đặt theo giờ không áp dụng hoàn tiền
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal hoàn tiền */}
            {showRefundModal && (
                <RefundModal
                    booking={booking}
                    onClose={() => setShowRefundModal(false)}
                    onConfirm={handleRefundConfirm}
                    submitting={refundSubmitting}
                />
            )}
        </div>
    );
};

export default BookingDetails;
