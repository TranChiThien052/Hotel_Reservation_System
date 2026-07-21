import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
import { paymentApi } from '../api/payment-api';
import { useAppSelector } from '@/app/store/hooks';
import { BsReceipt } from 'react-icons/bs';

const formatVND = (amount: number | string) =>
    Number(amount).toLocaleString('vi-VN') + 'đ';

const StaffPaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useAppSelector((s) => s.auth.user);
    const role = user?.role;

    const [paymentResult, setPaymentResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking list path based on role
    const bookingListPath =
        role === 'manager' ? '/manager/bookings' : '/staff/bookings';

    const verifyPayment = useCallback(async () => {
        setLoading(true);
        try {
            const response = await paymentApi.getZaloPayPaymentResult({
                appid: Number(searchParams.get('appid')),
                apptransid: searchParams.get('apptransid') || '',
                pmcid: searchParams.get('pmcid') || '',
                bankcode: searchParams.get('bankcode') || '',
                amount: Number(searchParams.get('amount')),
                discountamount: Number(searchParams.get('discountamount')),
                status: searchParams.get('status') || '',
                checksum: searchParams.get('checksum') || '',
            });
            setPaymentResult(response);
        } catch (err) {
            console.error('Error verifying payment:', err);
            setError('Không thể xác minh kết quả thanh toán. Vui lòng kiểm tra lại trên danh sách đặt phòng.');
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => { verifyPayment(); }, [verifyPayment]);

    const bookingId = paymentResult?.payments?.booking_id;
    const isSuccess = String(searchParams.get('status')) === '1';

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-green-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Đang xác minh thanh toán...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center gap-6">

                {/* Icon */}
                <div className="relative">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isSuccess && !error ? 'bg-green-100' : 'bg-red-100'}`}>
                        {isSuccess && !error
                            ? <IoCheckmarkCircle className="text-green-500 text-6xl" />
                            : <IoCloseCircle className="text-red-500 text-6xl" />
                        }
                    </div>
                    {isSuccess && !error && (
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow">
                            <span className="text-white text-xs font-bold">✓</span>
                        </div>
                    )}
                </div>

                {/* Title */}
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {isSuccess && !error ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
                    </h1>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        {isSuccess && !error
                            ? <>Giao dịch ZaloPay đã được xác nhận tại <span className="font-semibold text-amber-600">Aurora Hotel</span>.</>
                            : (error || 'Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức khác.')
                        }
                    </p>
                </div>

                {/* Payment details */}
                {isSuccess && paymentResult?.payments && (
                    <div className="w-full bg-gray-50 rounded-2xl p-5 flex flex-col gap-3 text-sm border border-gray-100">
                        {paymentResult.payments.amount && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Số tiền đã thu</span>
                                <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs uppercase tracking-wide">
                                    {formatVND(paymentResult.payments.amount)}
                                </span>
                            </div>
                        )}
                        {paymentResult.payments.created_at && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Thời gian</span>
                                <span className="font-semibold text-gray-700 text-xs">
                                    {new Date(paymentResult.payments.created_at).toLocaleString('vi-VN')}
                                </span>
                            </div>
                        )}
                        {paymentResult.payments.transaction_ref && (
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Mã giao dịch</span>
                                <span className="font-semibold text-gray-700 text-xs font-mono">
                                    {paymentResult.payments.transaction_ref}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Info box */}
                {isSuccess && (
                    <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 leading-relaxed flex items-start gap-2">
                        <BsReceipt className="text-blue-500 text-lg shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold mb-1">📋 Lưu ý cho nhân viên</p>
                            <p>
                                Khách hàng đã thanh toán qua ZaloPay. Vui lòng vào chi tiết đặt phòng để kiểm tra trạng thái và tiến hành check-in.
                            </p>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="w-full flex flex-col gap-3">
                    {isSuccess && bookingId && (
                        <button
                            onClick={() => navigate(`${bookingListPath}/${bookingId}`)}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
                        >
                            Xem chi tiết đặt phòng
                        </button>
                    )}
                    <button
                        onClick={() => navigate(bookingListPath)}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors cursor-pointer"
                    >
                        Về danh sách đặt phòng
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffPaymentSuccess;
