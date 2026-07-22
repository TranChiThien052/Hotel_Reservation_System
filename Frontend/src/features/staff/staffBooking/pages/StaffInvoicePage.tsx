import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/app/store/hooks';
import { bookingApi } from '../api/booking-api';
import { invoiceApi } from '../api/invoice-api';
import { paymentApi } from '../api/payment-api';
import { bookingServiceApi } from '../api/booking-service-api';
import type { Booking } from '../types/booking-type';
import { Button, Spin, message, Divider, Modal } from 'antd';
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import { BsReceipt } from 'react-icons/bs';
import { DollarOutlined, MobileOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { getBookingAmounts } from '@/features/client/profile/components/RefundModal';

const formatVND = (n: number | string) => Number(n).toLocaleString('vi-VN') + 'đ';
const formatDateTime = (str?: string | null) => {
    if (!str) return '—';
    return new Date(str).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{value}</span>
    </div>
);

const StaffInvoicePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const user = useAppSelector((state) => state.auth.user);
    const role = user?.role;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [payingCash, setPayingCash] = useState(false);
    const [payingZalo, setPayingZalo] = useState(false);
    const [paidSuccess, setPaidSuccess] = useState(false);
    const [confirmCashOpen, setConfirmCashOpen] = useState(false);

    const backPath   = role === 'manager' ? '/manager/bookings' : '/staff/bookings';
    const detailPath = `${backPath}/${id}`;

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [bookingData, allInvoices, bookingServices] = await Promise.all([
                bookingApi.getBookingById(id),
                invoiceApi.getAllInvoices(),
                bookingServiceApi.getByBookingId(id),
            ]);
            setBooking(bookingData);

            const amounts = getBookingAmounts(bookingData);
            const serviceCharge = bookingServices.reduce((sum: number, s: any) => sum + Number(s.total_amount || 0), 0);
            const roomCharge = amounts.subtotal;
            const discountAmount = Number(bookingData.discount_amount || 0);
            const depositUsed = amounts.paidAmount;
            
            const totalAmount = Math.max(0, roomCharge + serviceCharge - discountAmount);
            let amountDue = totalAmount - depositUsed;
            let refundAmount = 0;
            if (amountDue < 0) {
                refundAmount = Math.abs(amountDue);
                amountDue = 0;
            }

            const existingInvoice = allInvoices.find((inv: any) => inv.booking_id === id);
            let finalInvoice = existingInvoice;

            if (existingInvoice) {
                // Update the existing invoice if there are changes
                if (
                    Number(existingInvoice.room_charge) !== roomCharge ||
                    Number(existingInvoice.service_charge) !== serviceCharge ||
                    Number(existingInvoice.discount_amount) !== discountAmount ||
                    Number(existingInvoice.total_amount) !== totalAmount ||
                    Number(existingInvoice.deposit_used) !== depositUsed ||
                    Number(existingInvoice.amount_due) !== amountDue
                ) {
                     finalInvoice = await invoiceApi.updateInvoice(existingInvoice.id, {
                         room_charge: roomCharge,
                         service_charge: serviceCharge,
                         discount_amount: discountAmount,
                         total_amount: totalAmount,
                         deposit_used: depositUsed,
                         amount_due: amountDue,
                         refund_amount: refundAmount
                     });
                }
            } else {
                // Create a new invoice
                const newInvoice = await invoiceApi.createInvoice({
                    booking_id: id,
                    issued_by: user?.id ?? '',
                });
                
                // Immediately update it to ensure accurate numbers
                finalInvoice = await invoiceApi.updateInvoice(newInvoice.id, {
                    room_charge: roomCharge,
                    service_charge: serviceCharge,
                    discount_amount: discountAmount,
                    total_amount: totalAmount,
                    deposit_used: depositUsed,
                    amount_due: amountDue,
                    refund_amount: refundAmount,
                });
            }
            
            setInvoice(finalInvoice);
        } catch (err: any) {
            console.error(err);
            message.error(err?.response?.data?.error ?? 'Không thể tải hóa đơn.');
        } finally {
            setLoading(false);
        }
    }, [id, user?.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCashPayment = async () => {
        if (!booking || !invoice) return;
        setPayingCash(true);
        try {
            const amountDue = Number(invoice.amount_due ?? 0);
            if (amountDue > 0) {
                await paymentApi.createPayment({
                    booking_id: booking.id,
                    invoice_id: invoice.id,
                    payment_method: 'cash',
                    status: 'paid',
                    amount: amountDue,
                    is_deposit: false,
                    processed_by: user?.id,
                });
            }
            // Update booking status to completed
            await bookingApi.updateBooking(booking.id, { status: 'completed' } as any);
            setPaidSuccess(true);
            setConfirmCashOpen(false);
            message.success('Thanh toán tiền mặt thành công!');
        } catch (err: any) {
            message.error(err?.response?.data?.error ?? 'Thanh toán thất bại!');
        } finally {
            setPayingCash(false);
        }
    };

    const handleZaloPayPayment = async () => {
        if (!booking || !invoice) return;
        setPayingZalo(true);
        try {
            const amountDue = Number(invoice.amount_due ?? 0);
            if (amountDue <= 0) {
                message.warning('Không có số tiền cần thanh toán qua ZaloPay.');
                return;
            }
            // Store role in sessionStorage → BookingSuccess.tsx will read and redirect correctly
            sessionStorage.setItem('zp_role', role ?? 'staff');
            sessionStorage.setItem('zp_booking_id', booking.id);

            const res = await paymentApi.createZalopayPayment({
                booking_id: booking.id,
                booking_code: booking.booking_code,
                amount: amountDue,
                is_deposit: false,
            });

            if (res?.order_url) {
                window.location.href = res.order_url;
            } else {
                message.error('Không lấy được link thanh toán ZaloPay.');
            }
        } catch (err: any) {
            message.error(err?.response?.data?.error ?? 'Lỗi khi tạo thanh toán ZaloPay.');
        } finally {
            setPayingZalo(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Spin size="large" tip="Đang tạo hóa đơn..." />
        </div>
    );

    if (!booking || !invoice) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Không tìm thấy thông tin hóa đơn.</p>
        </div>
    );

    const amountDue     = Number(invoice.amount_due ?? 0);
    const isAlreadyPaid = amountDue <= 0;
    console.log('invoice', invoice);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Back */}
                <button
                    onClick={() => navigate(detailPath)}
                    className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-6 group cursor-pointer"
                >
                    <IoArrowBack className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Quay lại chi tiết đặt phòng</span>
                </button>

                {/* ── Success state ── */}
                {paidSuccess ? (
                    <div className="bg-white rounded-2xl shadow-lg p-10 flex flex-col items-center gap-5 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <IoCheckmarkCircle className="text-green-500 text-5xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Thanh toán thành công!</h1>
                        <p className="text-gray-500 text-sm">
                            Booking <strong>#{booking.booking_code}</strong> đã hoàn thành.
                        </p>
                        <Button
                            type="primary" size="large"
                            onClick={() => navigate(backPath)}
                            style={{ background: '#f97316', borderColor: '#f97316', minWidth: 200 }}
                        >
                            Về danh sách đặt phòng
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Invoice Header */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <BsReceipt className="text-amber-500 text-xl" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider">Hóa đơn</p>
                                    <h1 className="text-lg font-bold text-gray-900">#{invoice.invoice_code}</h1>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400">
                                Booking: <strong className="text-gray-700">#{booking.booking_code}</strong>
                                {invoice.created_at && (
                                    <span className="ml-3">Tạo lúc: {formatDateTime(invoice.created_at)}</span>
                                )}
                            </div>
                        </div>

                        {/* Invoice Details */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-5">
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Chi tiết hóa đơn</h2>

                            <InfoRow label="Tiền phòng" value={formatVND(invoice.room_charge ?? 0)} />
                            {Number(invoice.service_charge   ?? 0) > 0 && <InfoRow label="Phí dịch vụ" value={formatVND(invoice.service_charge)} />}
                            {Number(invoice.fine_charge      ?? 0) > 0 && <InfoRow label="Phí phạt" value={formatVND(invoice.fine_charge)} />}
                            {Number(invoice.late_checkout_fee  ?? 0) > 0 && <InfoRow label="Phí trả phòng muộn" value={formatVND(invoice.late_checkout_fee)} />}
                            {Number(invoice.early_checkout_fee ?? 0) > 0 && <InfoRow label="Phí trả phòng sớm" value={formatVND(invoice.early_checkout_fee)} />}
                            {Number(invoice.discount_amount  ?? 0) > 0 && (
                                <InfoRow label="Giảm giá" value={<span className="text-green-600">− {formatVND(invoice.discount_amount)}</span>} />
                            )}

                            <Divider style={{ margin: '8px 0' }} />
                            <InfoRow label="Tổng cộng" value={<strong>{formatVND(invoice.total_amount ?? 0)}</strong>} />

                            {Number(invoice.deposit_used ?? 0) > 0 && (
                                <InfoRow label="Tiền cọc đã trả" value={<span className="text-blue-600">− {formatVND(invoice.deposit_used)}</span>} />
                            )}
                            {Number(invoice.refund_amount ?? 0) > 0 && (
                                <InfoRow label="Hoàn lại khách" value={<span className="text-green-600">{formatVND(invoice.refund_amount)}</span>} />
                            )}

                            <Divider style={{ margin: '8px 0' }} />
                            <div className="flex justify-between items-center py-3 mt-1">
                                <span className="font-bold text-gray-900 text-base">Còn lại cần thu</span>
                                <span className={`font-bold text-2xl ${isAlreadyPaid ? 'text-green-500' : 'text-red-500'}`}>
                                    {isAlreadyPaid ? '0đ (Đã thanh toán)' : formatVND(amountDue)}
                                </span>
                            </div>
                        </div>

                        {/* Payment Buttons */}
                        {!isAlreadyPaid && (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                    Chọn phương thức thanh toán
                                </h2>
                                <div className="flex flex-col gap-3">
                                    <Button
                                        size="large" icon={<DollarOutlined />}
                                        onClick={() => setConfirmCashOpen(true)}
                                        style={{
                                            background: 'linear-gradient(90deg,#10b981,#34d399)',
                                            borderColor: '#10b981', color: '#fff',
                                            fontWeight: 700, height: 56, fontSize: 16,
                                        }}
                                        block
                                    >
                                        Thanh toán Tiền mặt
                                    </Button>
                                    <Button
                                        size="large" icon={<MobileOutlined />}
                                        loading={payingZalo} onClick={handleZaloPayPayment}
                                        style={{
                                            background: 'linear-gradient(90deg,#0068ff,#0049c6)',
                                            borderColor: '#0068ff', color: '#fff',
                                            fontWeight: 700, height: 56, fontSize: 16,
                                        }}
                                        block
                                    >
                                        Thanh toán ZaloPay
                                    </Button>
                                </div>
                            </div>
                        )}

                        {isAlreadyPaid && (
                            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
                                <CheckCircleOutlined className="text-green-500 text-2xl" />
                                <div>
                                    <p className="font-bold text-green-700">Hóa đơn đã được thanh toán</p>
                                    <p className="text-xs text-green-600">Booking đã hoàn tất, không cần thu thêm.</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Confirm Cash Modal */}
            <Modal
                title="Xác nhận thanh toán tiền mặt"
                open={confirmCashOpen}
                onCancel={() => setConfirmCashOpen(false)}
                onOk={handleCashPayment}
                confirmLoading={payingCash}
                okText="Xác nhận thu tiền" cancelText="Hủy"
                okButtonProps={{ style: { background: '#10b981', borderColor: '#10b981' } }}
            >
                <div className="py-2">
                    <p className="text-gray-600 mb-3">
                        Xác nhận đã thu <strong className="text-red-500 text-lg">{formatVND(amountDue)}</strong> tiền mặt từ khách?
                    </p>
                    <p className="text-xs text-gray-400">
                        Thao tác này sẽ hoàn tất booking <strong>#{booking?.booking_code}</strong>.
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default StaffInvoicePage;
