import { useNavigate, useLocation } from 'react-router-dom';
import { IoCheckmarkCircle } from 'react-icons/io5';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { MdOutlineBedroomParent } from 'react-icons/md';

const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

interface BookingSuccessState {
    roomTypeName?: string;
    checkin: string;
    checkout: string;
    numGuests: number;
    total: number;
    depositAmount?: number;
    paymentMode: 'full' | 'deposit';
    bookingType: 'daily' | 'hourly';
    nights?: number;
    durationHours?: number;
}

const BookingSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as BookingSuccessState | null;

    // Nếu không có state (vào trực tiếp URL), redirect về home
    if (!state) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Không có thông tin đặt phòng.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-amber-600 underline"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const {
        roomTypeName,
        checkin,
        checkout,
        numGuests,
        total,
        depositAmount,
        paymentMode,
        bookingType,
        nights,
        durationHours,
    } = state;

    const amountToPay = paymentMode === 'deposit' && depositAmount ? depositAmount : total;

    return (
        <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center gap-6">

                {/* Icon thành công */}
                <div className="relative">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                        <IoCheckmarkCircle className="text-green-500 text-6xl" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow">
                        <span className="text-white text-xs font-bold">✓</span>
                    </div>
                </div>

                {/* Tiêu đề */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt phòng thành công!</h1>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Cảm ơn bạn đã đặt phòng tại{' '}
                        <span className="font-semibold text-amber-600">Aurora Hotel</span>.<br />
                        Chúng tôi sẽ xác nhận trong thời gian sớm nhất.
                    </p>
                </div>

                {/* Chi tiết đặt phòng */}
                <div className="w-full bg-gray-50 rounded-2xl p-5 flex flex-col gap-3 text-sm border border-gray-100">

                    {roomTypeName && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500 flex items-center gap-1.5">
                                <MdOutlineBedroomParent className="text-amber-500" />
                                Loại phòng
                            </span>
                            <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs uppercase tracking-wide">
                                {roomTypeName}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-1.5">
                            <FaRegCalendarAlt className="text-amber-500" />
                            {bookingType === 'daily' ? 'Nhận phòng' : 'Thời gian'}
                        </span>
                        <span className="font-semibold">
                            {bookingType === 'daily' ? new Date(checkin).toLocaleDateString() : checkin}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-500 flex items-center gap-1.5">
                            <FaRegCalendarAlt className="text-gray-400" />
                            {bookingType === 'daily' ? 'Trả phòng' : 'Kết thúc'}
                        </span>
                        <span className="font-semibold">
                            {bookingType === 'daily' ? new Date(checkout).toLocaleDateString() : checkout}
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">Số khách</span>
                        <span className="font-semibold">{numGuests} người</span>
                    </div>

                    {bookingType === 'daily' && nights && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Thời gian lưu trú</span>
                            <span className="font-semibold">{nights} đêm</span>
                        </div>
                    )}
                    {bookingType === 'hourly' && durationHours && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-500">Thời gian lưu trú</span>
                            <span className="font-semibold">{durationHours} giờ</span>
                        </div>
                    )}

                    <div className="border-t border-gray-200 pt-3 mt-1 flex flex-col gap-1.5">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tổng tiền phòng</span>
                            <span className="font-semibold">{formatVND(total)}</span>
                        </div>
                        {paymentMode === 'deposit' && depositAmount && (
                            <>
                                <div className="flex justify-between text-amber-700">
                                    <span className="flex items-center gap-1">⬤ Tiền đặt cọc (30%)</span>
                                    <span className="font-bold">{formatVND(depositAmount)}</span>
                                </div>
                                <div className="flex justify-between text-gray-400 text-xs">
                                    <span>Còn lại thanh toán khi nhận phòng</span>
                                    <span>{formatVND(total - depositAmount)}</span>
                                </div>
                            </>
                        )}
                        {paymentMode === 'full' && (
                            <div className="flex justify-between text-green-700">
                                <span className="font-semibold">✓ Đã thanh toán toàn bộ</span>
                                <span className="font-bold">{formatVND(amountToPay)}</span>
                            </div>
                        )}
                    </div>
                </div>

                
                <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
                    <p className="font-semibold mb-1">📧 Thông tin xác nhận</p>
                    <p>Chúng tôi sẽ gửi email xác nhận và mã booking đến địa chỉ email của bạn trong vòng 15 phút.</p>
                </div>

                
                <div className="w-full flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/rooms')}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
                    >
                        Khám phá thêm phòng
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-400 hover:text-gray-600 underline cursor-pointer"
                    >
                        Về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccess;
