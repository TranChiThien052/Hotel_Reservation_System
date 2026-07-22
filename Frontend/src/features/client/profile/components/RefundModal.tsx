import { useState } from 'react';
import type { Booking } from '@/features/staff/staffBooking/types/booking-type';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { FaExclamationTriangle } from 'react-icons/fa';
import { MdOutlineMoneyOffCsred } from 'react-icons/md';


const formatVND = (n: number | string) =>
    Number(n).toLocaleString('vi-VN') + 'đ';


export interface RefundInfo {   
    amount: number;
    isFullRefund: boolean;
    reason: string;
}

export interface BookingAmounts {
    subtotal: number;
    totalAmount: number;
    depositAmount: number;
    paidAmount: number;
    isDepositPaid: boolean;
    isFullPaid: boolean;
    remainingAmount: number;
}

export const getBookingAmounts = (booking: Booking): BookingAmounts => {
    const isHourly = booking.booking_type === 'hourly';
    const roomPriceSnapshot = Number(booking.room_price_snapshot ?? 0);
    const discountAmount = Number(booking.discount_amount ?? 0);

    const checkinDate = new Date(booking.checkin_at);
    const checkoutDate = new Date(booking.checkout_at);
    const diffMs = Math.max(0, checkoutDate.getTime() - checkinDate.getTime());
    
    const duration = isHourly
        ? Math.max(1, Math.round(diffMs / (1000 * 60 * 60)))
        : Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    const computedSubtotal = roomPriceSnapshot * duration;
    const computedTotal = Math.max(0, computedSubtotal - discountAmount);

    const rawSubtotal = Number(booking.subtotal ?? 0);
    const rawTotal = Number(booking.total_amount ?? 0);

    // Tự động tính lại nếu Backend trả về 0 (do bug updateBooking ở BE)
    const subtotal = rawSubtotal > 0 ? rawSubtotal : computedSubtotal;
    const totalAmount = rawTotal > 0 ? rawTotal : computedTotal;

    const rawDeposit = Number(booking.deposit_amount ?? 0);
    const computedDeposit = Math.ceil((totalAmount * 0.3) / 1000) * 1000;
    const depositAmount = rawDeposit > 0 ? rawDeposit : computedDeposit;

    // Lấy danh sách các khoản thanh toán thành công
    const validPayments = booking.payments
        ? booking.payments.filter(p => !p.status || p.status === 'paid' || p.status === 'success' || p.status === 'completed')
        : [];

    const paidPaymentsSum = validPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

    // Kiểm tra thanh toán 100%
    const hasFullPayment = validPayments.some(p => p.is_deposit === false || Number(p.amount || 0) >= totalAmount - 1000);
    const isCompletedOrCheckedOut = ['completed', 'checked_out'].includes(booking.status);

    const isDepositPaid = Boolean(
        booking.deposit_paid_at ||
        paidPaymentsSum > 0 ||
        validPayments.length > 0 ||
        isCompletedOrCheckedOut ||
        ['confirmed', 'checked_in'].includes(booking.status)
    );

    let isFullPaid = false;
    let paidAmount = 0;

    if (isCompletedOrCheckedOut || hasFullPayment || paidPaymentsSum >= totalAmount - 1000) {
        isFullPaid = true;
        paidAmount = paidPaymentsSum > 0 ? paidPaymentsSum : totalAmount;
    } else if (isDepositPaid) {
        paidAmount = paidPaymentsSum > 0 ? paidPaymentsSum : depositAmount;
        isFullPaid = paidAmount >= totalAmount - 1000;
    }

    const remainingAmount = isFullPaid ? 0 : Math.max(0, totalAmount - paidAmount);

    return {
        subtotal,
        totalAmount,
        depositAmount,
        paidAmount,
        isDepositPaid,
        isFullPaid,
        remainingAmount
    };
};


export const calcRefund = (booking: Booking): RefundInfo => {
    const createdAt = new Date(booking.created_at);
    const now = new Date();
    const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const pricePerNight = Number(booking.room_price_snapshot ?? 0);
    
    const { paidAmount, isFullPaid, isDepositPaid } = getBookingAmounts(booking);

    if (!isDepositPaid || paidAmount <= 0) {
        return {
            amount: 0,
            isFullRefund: false,
            reason: 'Đơn đặt phòng chưa được thanh toán cọc hoặc thanh toán',
        };
    }

    if (hoursElapsed <= 24) {
        return {
            amount: paidAmount,
            isFullRefund: true,
            reason: `Hủy trong vòng 24 giờ sau khi đặt — hoàn 100% số tiền đã trả (${formatVND(paidAmount)})`,
        };
    } else {
        if (!isFullPaid) {
            return {
                amount: 0,
                isFullRefund: false,
                reason: 'Hủy sau 24 giờ — không được hoàn tiền đặt cọc',
            };
        } else {
            const refund = Math.max(0, paidAmount - pricePerNight);
            return {
                amount: refund,
                isFullRefund: false,
                reason: `Hủy sau 24 giờ — trừ 1 đêm phí phòng (${formatVND(pricePerNight)})`,
            };
        }
    }
};


interface RefundModalProps {
    booking: Booking;
    onClose: () => void;
    onConfirm: (reason: string, refundAmount: number) => void;
    submitting: boolean;
}


const RefundModal = ({ booking, onClose, onConfirm, submitting }: RefundModalProps) => {
    const [reason, setReason] = useState('');
    const refund = calcRefund(booking);

    const handleSubmit = () => {
        if (!reason.trim()) return;
        onConfirm(reason, refund.amount);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal card */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <MdOutlineMoneyOffCsred className="text-red-500 text-2xl" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Yêu cầu hoàn tiền</h3>
                        <p className="text-xs text-gray-400">Đơn #{booking.booking_code}</p>
                    </div>
                </div>

                {/* Thông tin số tiền hoàn */}
                <div className={`rounded-xl border-2 p-4 mb-4 ${
                    refund.isFullRefund ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
                }`}>
                    <div className="flex items-start gap-2">
                        {refund.isFullRefund ? (
                            <IoCheckmarkCircle className="text-green-500 text-lg mt-0.5 shrink-0" />
                        ) : (
                            <FaExclamationTriangle className="text-amber-500 text-base mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${refund.isFullRefund ? 'text-green-700' : 'text-amber-700'}`}>
                                {refund.reason}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-gray-500">Số tiền hoàn:</span>
                                <span className={`font-bold text-lg ${refund.isFullRefund ? 'text-green-600' : 'text-amber-600'}`}>
                                    {formatVND(refund.amount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chính sách */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                    <p className="text-xs text-blue-700 font-semibold mb-1">📋 Chính sách hoàn tiền</p>
                    <ul className="text-xs text-blue-600 space-y-1 list-disc list-inside">
                        <li>Hủy trong vòng <strong>24 giờ</strong> sau khi đặt → hoàn <strong>100%</strong></li>
                        <li>Hủy sau 24 giờ → trừ <strong>1 đêm</strong> phí phòng (đối với thanh toán toàn bộ) hoặc <strong>không hoàn cọc</strong> (nếu chỉ đặt cọc)</li>
                        <li>Chỉ áp dụng cho đặt phòng <strong>theo ngày</strong></li>
                        <li>Yêu cầu sẽ được gửi đến quản lý chi nhánh để xét duyệt</li>
                    </ul>
                </div>

                {/* Lý do */}
                <div className="mb-5">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">
                        Lý do hủy phòng <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Vui lòng cho chúng tôi biết lý do bạn muốn hủy phòng..."
                        rows={3}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-gray-50"
                    />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || !reason.trim()}
                        className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                        {submitting && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RefundModal;
