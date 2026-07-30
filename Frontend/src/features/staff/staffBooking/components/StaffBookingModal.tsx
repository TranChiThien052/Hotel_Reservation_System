import { useCallback, useEffect, useState } from 'react';
import { Modal, message, Spin } from 'antd';
import { roomTypesApi } from '@/features/admin/adminRoomTypes/api/roomTypes-api';
import { roomPricesApi } from '@/features/admin/adminRoomsPrices/api/roomPrices-api';
import { bookingApi } from '../api/booking-api';
import { customersApi } from '@/features/admin/adminCustomers/api/customers-api';
import { paymentApi } from '../api/payment-api';
import { useAppSelector } from '@/app/store/hooks';
import { IoCheckmarkCircle } from 'react-icons/io5';
import {
    MdOutlineHotel,
    MdOutlinePersonOutline,
    MdOutlinePhone,
    MdOutlineMail,
    MdOutlineCreditCard,
    MdOutlinePublic,
    MdOutlineCake,
    MdOutlineHome,
    MdOutlineNotes,
} from 'react-icons/md';
import { FaRegCalendarAlt, FaRegUser, FaSearch } from 'react-icons/fa';
import { BsCash } from 'react-icons/bs';
import { SiZalo } from 'react-icons/si';
import { MdOutlineCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';


const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const todayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
};
const tomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
};
const hourlyTodayStr = () => {
  const d = new Date();
  d.setDate(d.getDate());
  return d.toISOString().split("T")[0];
};
const getCurrentTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0, 0, 0);
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};
const diffDays = (from: string, to: string): number => {
    if (!from || !to) return 0;
    const ms = new Date(to).getTime() - new Date(from).getTime();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

const steps = ['Thời gian & Phòng', 'Khách hàng', 'Xác nhận', 'Thanh toán'];

const StepBar = ({ current }: { current: number }) => (
    <div className="flex items-center gap-0 mb-6">
        {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                        i < current ? 'bg-amber-500 border-amber-500 text-white'
                        : i === current ? 'bg-white border-amber-500 text-amber-600'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                        {i < current ? <IoCheckmarkCircle className="text-base" /> : i + 1}
                    </div>
                    <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
                        i === current ? 'text-amber-600' : i < current ? 'text-amber-500' : 'text-gray-400'
                    }`}>{label}</span>
                </div>
                {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-3.5 transition-colors ${i < current ? 'bg-amber-500' : 'bg-gray-200'}`} />
                )}
            </div>
        ))}
    </div>
);

interface StaffBookingModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    branchId: string;
}

const StaffBookingModal = ({ open, onClose, onSuccess, branchId }: StaffBookingModalProps) => {
    const user = useAppSelector((s) => s.auth.user);
    const role = user?.role;
    const navigate = useNavigate();

    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Step 0
    const [bookingType, setBookingType] = useState<'daily' | 'hourly'>('daily');
    const [checkinAt, setCheckinAt] = useState(todayStr());
    const [checkoutAt, setCheckoutAt] = useState(tomorrowStr());
    const [bookingDate, setBookingDate] = useState(hourlyTodayStr());
    const [startTime, setStartTime] = useState(getCurrentTime());
    const [durationHours, setDurationHours] = useState(2);
    const [numGuests, setNumGuests] = useState(1);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
    const [notes, setNotes] = useState('');

    // Phòng available
    const [availableRooms, setAvailableRooms] = useState<{ id: string; room_number: string }[]>([]);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [roomsLoading, setRoomsLoading] = useState(false);

    // Data
    const [roomTypes, setRoomTypes] = useState<any[]>([]);
    const [roomPrices, setRoomPrices] = useState<any[]>([]);
    const [dataLoading, setDataLoading] = useState(false);

    // Step 1
    const [allCustomers, setAllCustomers] = useState<any[]>([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [isNewCustomer, setIsNewCustomer] = useState(false);
    const [duplicateCustomer, setDuplicateCustomer] = useState<any>(null); // khách hàng trùng phone/CCCD
    const [guestForm, setGuestForm] = useState({
        full_name: '', phone: '', email: '', id_card_number: '',
        nationality: 'Việt Nam', date_of_birth: '', address: '',
    });

    // Step 3 - Created booking
    const [createdBooking, setCreatedBooking] = useState<any>(null);

    const fetchData = useCallback(async () => {
        if (!open) return;
        setDataLoading(true);
        try {
            const [rts, rps, customers] = await Promise.all([
                roomTypesApi.getRoomTypeByBranchId(branchId),
                roomPricesApi.getRoomPricesByBranchId(branchId),
                customersApi.getAllCustomers(),
            ]);
            console.log('Fetched data:', { rts, rps, customers });
            const filteredTypes = Array.isArray(rts)
                ? rts.filter((rt: any) => rt.is_active !== false)
                : [];
            setRoomTypes(filteredTypes);
            setRoomPrices(Array.isArray(rps) ? rps : []);
            setAllCustomers(Array.isArray(customers) ? customers : []);
        } catch (err) {
            console.error(err);
            message.error('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setDataLoading(false);
        }
    }, [open, branchId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (!open) {
            setStep(0);
            setBookingType('daily');
            setCheckinAt(todayStr());
            setCheckoutAt(tomorrowStr());
            setBookingDate(hourlyTodayStr());
            setStartTime(getCurrentTime());
            setDurationHours(2);
            setNumGuests(1);
            setSelectedRoomTypeId('');
            setAvailableRooms([]);
            setSelectedRoomId('');
            setNotes('');
            setCustomerSearch('');
            setSelectedCustomer(null);
            setIsNewCustomer(false);
            setDuplicateCustomer(null);
            setGuestForm({ full_name: '', phone: '', email: '', id_card_number: '', nationality: 'Việt Nam', date_of_birth: '', address: '' });
            setCreatedBooking(null);
            setErrorMsg('');
            setSubtotal(0);
            setCalculatingPrice(false);
        }
    }, [open]);

    const selectedRoomType = roomTypes.find((rt) => rt.id === selectedRoomTypeId);
    const selectedPrice = roomPrices.find((rp) => rp.room_type_id === selectedRoomTypeId);
    const pricePerNight = selectedPrice ? Number(selectedPrice.price_per_day ?? 0) : 0;
    const pricePerHour = selectedPrice ? Number(selectedPrice.price_per_hour ?? 0) : 0;
    const nights = bookingType === 'daily' ? diffDays(checkinAt, checkoutAt) : 0;

    const hourlyCheckin = `${bookingDate}T${startTime}:00`;
    const hourlyCheckout = (() => {
        const d = new Date(`${bookingDate}T${startTime}:00`);
        d.setHours(d.getHours() + durationHours);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00.000`;
    })();

    const [subtotal, setSubtotal] = useState(0);
    const [calculatingPrice, setCalculatingPrice] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchPrice = async () => {
            if (!selectedRoomTypeId || !branchId) {
                if (isMounted) setSubtotal(0);
                return;
            }

            const finalCheckin = bookingType === 'daily' ? checkinAt : hourlyCheckin;
            const finalCheckout = bookingType === 'daily' ? checkoutAt : hourlyCheckout;

            if (!finalCheckin || !finalCheckout) {
                if (isMounted) setSubtotal(0);
                return;
            }

            setCalculatingPrice(true);
            try {
                const price = await bookingApi.calculateBookingPrice({
                    room_type_id: selectedRoomTypeId,
                    branch_id: branchId,
                    booking_type: bookingType,
                    checkin_at: finalCheckin,
                    checkout_at: finalCheckout,
                });

                if (isMounted) {
                    setSubtotal(Number(price) || 0);
                }
            } catch (err) {
                console.error('Lỗi tính giá phòng:', err);
            } finally {
                if (isMounted) {
                    setCalculatingPrice(false);
                }
            }
        };

        fetchPrice();
        return () => {
            isMounted = false;
        };
    }, [
        bookingType,
        checkinAt,
        checkoutAt,
        hourlyCheckin,
        hourlyCheckout,
        selectedRoomTypeId,
        branchId,
    ]);

    // Fetch phòng trống khi đã chọn loại phòng + thời gian
    useEffect(() => {
        let active = true;
        const finalCheckin = bookingType === 'daily' ? checkinAt : hourlyCheckin;
        const finalCheckout = bookingType === 'daily' ? checkoutAt : hourlyCheckout;
        const ready = selectedRoomTypeId && branchId && finalCheckin && finalCheckout
            && (bookingType === 'daily' ? nights > 0 : durationHours >= 1);

        if (!ready) {
            setAvailableRooms([]);
            setSelectedRoomId('');
            return;
        }
        setRoomsLoading(true);
        setSelectedRoomId('');

        const fetchRooms = async () => {
            try {
                const availableRoomData = await bookingApi.searchAvailableRooms({
                    branch_id: branchId,
                    checkin_at: finalCheckin,
                    checkout_at: finalCheckout,
                    room_type_id: selectedRoomTypeId,
                    booking_type: bookingType,
                });
                
                    console.log('Available rooms data:', availableRoomData);
                if (!active) return;
                if(availableRoomData?.results?.[0].is_sold_out){
                    setAvailableRooms([]);
                    return;
                }
                else{
                    const rooms = availableRoomData?.results?.[0]?.room_type?.availble_rooms ?? [];
                    setAvailableRooms(Array.isArray(rooms) ? rooms : []);
                }

                
            } catch {
                if (active) setAvailableRooms([]);
            } finally {
                if (active) setRoomsLoading(false);
            }
        };
        fetchRooms();
        return () => { active = false; };
    }, [bookingType, checkinAt, checkoutAt, hourlyCheckin, hourlyCheckout, selectedRoomTypeId, branchId, nights, durationHours]);

    const step0Valid = selectedRoomTypeId !== '' && selectedRoomId !== '' && numGuests >= 1 && (
        bookingType === 'daily' ? nights > 0 : bookingDate !== '' && startTime !== '' && durationHours >= 1
    );
    const step1Valid = isNewCustomer
        ? guestForm.full_name.trim() !== '' && guestForm.phone.trim() !== '' && guestForm.email.trim() !== '' && guestForm.id_card_number.trim() !== '' && guestForm.date_of_birth !== ''
        : selectedCustomer !== null;

    const filteredCustomers = allCustomers.filter((c) => {
        const q = customerSearch.toLowerCase();
        return c.full_name?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    });

    // Kiểm tra trùng lặp khi nhập phone hoặc CCCD (chỉ khi đang ở chế độ tạo mới)
    useEffect(() => {
        if (!isNewCustomer) { setDuplicateCustomer(null); return; }
        const phoneNorm = guestForm.phone.trim().replace(/\s+/g, ''); // Loại bỏ khoảng trắng
        const idCardNorm = guestForm.id_card_number.trim();
        if (!phoneNorm && !idCardNorm) { setDuplicateCustomer(null); return; }

        const found = allCustomers.find((c: any) => {
            const cPhone = (c.phone ?? '').replace(/\s+/g, '');
            const cIdCard = (c.id_card_number ?? '');
            return (phoneNorm && cPhone === phoneNorm) || (idCardNorm && cIdCard === idCardNorm);
        });
        setDuplicateCustomer(found ?? null);
    }, [guestForm.phone, guestForm.id_card_number, isNewCustomer, allCustomers]);

    // Step 2 → Step 3: Tạo booking rồi chuyển sang bước thanh toán
    const handleCreateBooking = async () => {
        setSubmitting(true);
        setErrorMsg('');
        try {
            let customerId = selectedCustomer?.id ?? null;
            if (isNewCustomer || !customerId) {
                // Kiểm tra trùng lặp: phone hoặc CCCD đã tồn tại trong database chưa
                const phoneNorm = guestForm.phone.trim().replace(/\s+/g, '');
                const idCardNorm = guestForm.id_card_number.trim();
                const existing = allCustomers.find((c: any) => {
                    const cPhone = (c.phone ?? '').replace(/\s+/g, '');
                    const cIdCard = (c.id_card_number ?? '');
                    return (phoneNorm && cPhone === phoneNorm) || (idCardNorm && cIdCard === idCardNorm);
                });

                if (existing) {
                    customerId = existing.id;
                } else {
                    const newCust = await customersApi.createCustomer({
                        full_name: guestForm.full_name,
                        phone: guestForm.phone,
                        email: guestForm.email,
                        id_card_number: guestForm.id_card_number,
                        nationality: guestForm.nationality,
                        date_of_birth: guestForm.date_of_birth,
                        address: guestForm.address || undefined,
                    });
                    customerId = newCust?.id ?? newCust?.data?.id;
                }
            }
            if (!customerId) throw new Error('Không thể lấy thông tin khách hàng.');

            const finalCheckin = bookingType === 'daily' ? checkinAt : hourlyCheckin;
            const finalCheckout = bookingType === 'daily' ? checkoutAt : hourlyCheckout;

            const bookingRes = await bookingApi.createBooking({
                room_type_id: selectedRoomTypeId,
                assigned_room_id: selectedRoomId || undefined,
                branch_id: branchId,
                customer_id: customerId,
                booking_type: bookingType,
                status: 'confirmed',
                checkin_at: finalCheckin,
                checkout_at: finalCheckout,
                num_guests: numGuests,
                created_by: user?.id ?? '',
                notes: notes || undefined,
            } as any);

            setCreatedBooking(bookingRes);
            setStep(3);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err?.response?.data?.message ?? err?.message ?? 'Tạo đặt phòng thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    // Step 3: Thanh toán tiền mặt
    const handlePayCash = async () => {
        if (!createdBooking) return;
        setSubmitting(true);
        try {
            await paymentApi.createPayment({
                booking_id: createdBooking.id,
                payment_method: 'cash',
                amount: createdBooking?.charge?.total ?? createdBooking?.total_amount ?? 0,
                status: 'paid',
                is_deposit: false,
                processed_by: user?.id ?? '',
            });
            message.success('Thanh toán tiền mặt thành công!');
            onSuccess();
            onClose();
            navigate(`/${role}/bookings/${createdBooking.id}`);
        } catch (err: any) {
            console.error(err);
            message.error(err?.response?.data?.message ?? 'Thanh toán thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    // Step 3: Thanh toán ZaloPay
    const handlePayZaloPay = async () => {
        if (!createdBooking) return;
        const amount = Number(createdBooking?.charge?.total ?? createdBooking?.total_amount ?? 0);
        if (amount <= 0) { message.warning('Không có số tiền thanh toán.'); return; }
        setSubmitting(true);
        try {
            sessionStorage.setItem('zp_role', role ?? 'staff');
            sessionStorage.setItem('zp_booking_id', createdBooking.id);
            const zpRes = await paymentApi.createZalopayPayment({
                booking_id: createdBooking.id,
                booking_code: createdBooking.booking_code,
                amount,
                is_deposit: false,
            });
            if (zpRes?.order_url)
                window.location.href = zpRes.order_url;
            else
                message.error('Không lấy được link thanh toán ZaloPay.');
        } catch (err: any) {
            console.error(err);
            message.error(err?.response?.data?.message ?? 'Lỗi khi tạo thanh toán ZaloPay.');
        } finally {
            setSubmitting(false);
        }
    };

    // Step 3: Nhận phòng chưa thanh toán
    const handleCheckinUnpaid = async () => {
        if (!createdBooking) return;
        message.success('Đặt phòng thành công! Khách hàng sẽ thanh toán sau.');
        onSuccess();
        onClose();
        navigate(`/${role}/bookings/${createdBooking.id}`);
    };

    // Step 3: Hủy booking
    const handleCancelBooking = async () => {
        if (!createdBooking) return;
        setSubmitting(true);
        try {
            await bookingApi.updateBooking(createdBooking.id, {
                ...createdBooking,
                status: 'cancelled',
            });
            message.info('Đã hủy đặt phòng.');
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            message.error(err?.response?.data?.message ?? 'Hủy đặt phòng thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal open={open} onCancel={onClose} footer={null} width={700} title={null} centered destroyOnClose>
            <div className="py-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MdOutlineHotel className="text-amber-500 text-2xl" /> Tạo đơn đặt phòng mới
                </h2>
                <StepBar current={step} />

                {dataLoading ? (
                    <div className="flex justify-center py-10"><Spin size="large" tip="Đang tải dữ liệu..." /></div>
                ) : (
                    <>
                        {/* STEP 0 */}
                        {step === 0 && (
                            <div className="flex flex-col gap-5">
                                {/* Loại đặt */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">Loại đặt phòng</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {(['daily', 'hourly'] as const).map((type) => (
                                            <button key={type} type="button" onClick={() => setBookingType(type)}
                                                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${bookingType === type ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300'}`}>
                                                {type === 'daily'
                                                    ? <FaRegCalendarAlt className="text-xl shrink-0" />
                                                    : <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" /></svg>
                                                }
                                                <div className="text-left">
                                                    <p className="font-bold text-sm">{type === 'daily' ? 'Theo ngày' : 'Theo giờ'}</p>
                                                    <p className="text-xs opacity-70">
                                                        {type === 'daily'
                                                            ? (pricePerNight > 0 ? formatVND(pricePerNight) + ' / đêm' : 'Chọn loại phòng trước')
                                                            : (pricePerHour > 0 ? formatVND(pricePerHour) + ' / giờ' : 'Chọn loại phòng trước')
                                                        }
                                                    </p>
                                                </div>
                                                {bookingType === type && <IoCheckmarkCircle className="ml-auto text-amber-500 text-lg" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Loại phòng */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                        <MdOutlineHotel className="text-gray-400" /> Loại phòng
                                    </label>
                                    {roomTypes.length === 0 ? (
                                        <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-200">Không có loại phòng nào khả dụng cho chi nhánh này.</p>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                                            {roomTypes.map((rt) => {
                                                const price = roomPrices.find((rp) =>
                                                    rp.room_types?.id === rt.id || rp.room_type_id === rt.id
                                                );
                                                const hasPrice = !!price;
                                                const isSelected = selectedRoomTypeId === rt.id;
                                                return (
                                                    <button key={rt.id} type="button"
                                                        disabled={!hasPrice}
                                                        onClick={() => hasPrice && setSelectedRoomTypeId(rt.id)}
                                                        className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left ${
                                                            !hasPrice
                                                                ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                                                                : isSelected
                                                                    ? 'border-amber-500 bg-amber-50 cursor-pointer'
                                                                    : 'border-gray-200 hover:border-amber-300 cursor-pointer'
                                                        }`}>
                                                        <div>
                                                            <p className="font-semibold text-sm text-gray-800">{rt.name}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">Tối đa {rt.max_guests} khách</p>
                                                        </div>
                                                        <div className="text-right text-sm">
                                                            {hasPrice ? (
                                                                <>
                                                                    <p className="font-bold text-amber-600">{formatVND(Number(price.price_per_day ?? 0))} / đêm</p>
                                                                    <p className="text-xs text-gray-400">{formatVND(Number(price.price_per_hour ?? 0))} / giờ</p>
                                                                </>
                                                            ) : (
                                                                <p className="text-xs text-red-400 font-medium">Chưa có bảng giá</p>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Thời gian */}
                                {bookingType === 'daily' ? (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Ngày nhận phòng</label>
                                            <input type="date" value={checkinAt} min={todayStr()}
                                                onChange={(e) => { setCheckinAt(e.target.value); if (e.target.value >= checkoutAt) setCheckoutAt(''); }}
                                                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 cursor-pointer" />
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Ngày trả phòng</label>
                                            <input type="date" value={checkoutAt} min={checkinAt || todayStr()}
                                                onChange={(e) => setCheckoutAt(e.target.value)}
                                                className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 cursor-pointer" />
                                        </div>
                                        {nights > 0 && (
                                            <div className="col-span-2 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
                                                <FaRegCalendarAlt />
                                                <span>Lưu trú: <strong>{nights} đêm</strong> · Tạm tính: <strong>{calculatingPrice ? 'Đang tính...' : formatVND(subtotal)}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-gray-700">Ngày đặt</label>
                                                <input type="date" value={bookingDate} min={todayStr()}
                                                    onChange={(e) => setBookingDate(e.target.value)}
                                                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 cursor-pointer" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-sm font-semibold text-gray-700">Giờ bắt đầu</label>
                                                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                                                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-semibold text-gray-700">Số giờ thuê</label>
                                            <div className="flex items-center gap-3">
                                                <button type="button" onClick={() => setDurationHours((h) => Math.max(1, h - 1))}
                                                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 font-bold cursor-pointer">−</button>
                                                <span className="w-8 text-center font-semibold text-gray-800">{durationHours}</span>
                                                <button type="button" onClick={() => setDurationHours((h) => Math.min(24, h + 1))}
                                                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 font-bold cursor-pointer">+</button>
                                                <span className="text-sm text-gray-400">giờ (tối đa 24)</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle cx="12" cy="12" r="10" strokeWidth="2" /><path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
                                            </svg>
                                            <span>
                                                Từ <strong>{startTime}</strong> — đến <strong>{(() => { const d = new Date(`${bookingDate}T${startTime}`); d.setHours(d.getHours() + durationHours); return d.toTimeString().slice(0, 5); })()}</strong> ({durationHours}h)
                                                <span> · Tạm tính: <strong>{calculatingPrice ? 'Đang tính...' : formatVND(subtotal)}</strong></span>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* === Chọn phòng === */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <MdOutlineHotel className="text-gray-400" /> Chọn phòng
                                        {roomsLoading && <span className="text-xs font-normal text-amber-500">Đang tải...</span>}
                                    </label>

                                    {/* Chưa đủ điều kiện */}
                                    {(!selectedRoomTypeId || (bookingType === 'daily' ? nights <= 0 : !bookingDate || !startTime)) && (
                                        <p className="text-xs text-gray-400 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl py-3">
                                            Chọn loại phòng và thời gian để xem phòng trống.
                                        </p>
                                    )}

                                    {/* Đang load */}
                                    {roomsLoading && selectedRoomTypeId && (bookingType === 'daily' ? nights > 0 : bookingDate && startTime) && (
                                        <div className="flex justify-center py-4">
                                            <svg className="w-6 h-6 animate-spin text-amber-400" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Không có phòng */}
                                    {!roomsLoading && selectedRoomTypeId && (bookingType === 'daily' ? nights > 0 : bookingDate && startTime) && availableRooms.length === 0 && (
                                        <p className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-xl py-3">
                                            Không có phòng trống trong khoảng thời gian này.
                                        </p>
                                    )}

                                    {/* Danh sách phòng */}
                                    {!roomsLoading && availableRooms.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2">
                                            {availableRooms.map((room) => (
                                                <button
                                                    key={room.id}
                                                    type="button"
                                                    onClick={() => setSelectedRoomId(room.id)}
                                                    className={`flex flex-col items-center py-3 px-2 rounded-xl border-2 cursor-pointer transition-all ${
                                                        selectedRoomId === room.id
                                                            ? 'border-amber-500 bg-amber-50'
                                                            : 'border-gray-200 bg-white hover:border-amber-300'
                                                    }`}
                                                >
                                                    <span className="font-bold text-gray-800 text-sm">Phòng {room.room_number}</span>
                                                    {selectedRoomId === room.id && (
                                                        <span className="mt-1 text-xs text-amber-600 font-semibold flex items-center gap-0.5">
                                                            <IoCheckmarkCircle /> Đã chọn
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Số khách */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                        <FaRegUser className="text-gray-400" /> Số khách
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => setNumGuests((g) => Math.max(1, g - 1))}
                                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 font-bold cursor-pointer">−</button>
                                        <span className="w-8 text-center font-semibold text-gray-800">{numGuests}</span>
                                        <button type="button" onClick={() => setNumGuests((g) => Math.min(selectedRoomType?.max_guests ?? 10, g + 1))}
                                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 font-bold cursor-pointer">+</button>
                                        {selectedRoomType && <span className="text-sm text-gray-400">/ tối đa {selectedRoomType.max_guests} khách</span>}
                                    </div>
                                </div>

                                {/* Ghi chú */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                                        <MdOutlineNotes className="text-gray-400" /> Ghi chú
                                    </label>
                                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                                        placeholder="Yêu cầu đặc biệt, ghi chú thêm..." rows={2}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 resize-none" />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <button disabled={!step0Valid} onClick={() => setStep(1)}
                                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-xl transition-colors cursor-pointer">
                                        Tiếp theo →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="flex flex-col gap-5">
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => { setIsNewCustomer(false); setSelectedCustomer(null); }}
                                        className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all cursor-pointer ${!isNewCustomer ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                        Tìm khách có sẵn
                                    </button>
                                    <button type="button" onClick={() => { setIsNewCustomer(true); setSelectedCustomer(null); setCustomerSearch(''); }}
                                        className={`flex-1 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all cursor-pointer ${isNewCustomer ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                        + Khách mới
                                    </button>
                                </div>

                                {!isNewCustomer ? (
                                    <div className="flex flex-col gap-3">
                                        <div className="relative">
                                            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input type="text" value={customerSearch}
                                                onChange={(e) => { setCustomerSearch(e.target.value); setSelectedCustomer(null); }}
                                                placeholder="Tìm theo tên, số điện thoại, email..."
                                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50" />
                                        </div>
                                        {selectedCustomer ? (
                                            <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-500 rounded-xl">
                                                <div>
                                                    <p className="font-bold text-gray-800">{selectedCustomer.full_name}</p>
                                                    <p className="text-sm text-gray-500">{selectedCustomer.phone} · {selectedCustomer.email}</p>
                                                    {selectedCustomer.id_card_number && <p className="text-xs text-gray-400">CCCD: {selectedCustomer.id_card_number}</p>}
                                                </div>
                                                <button type="button" onClick={() => setSelectedCustomer(null)}
                                                    className="text-xs text-red-500 hover:text-red-700 cursor-pointer">Bỏ chọn</button>
                                            </div>
                                        ) : customerSearch.length > 0 ? (
                                            filteredCustomers.length > 0 ? (
                                                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                                                    {filteredCustomers.map((c) => (
                                                        <button key={c.id} type="button" onClick={() => setSelectedCustomer(c)}
                                                            className="w-full text-left px-4 py-3 hover:bg-amber-50 transition-colors border-b border-gray-100 last:border-0 cursor-pointer">
                                                            <p className="font-semibold text-sm text-gray-800">{c.full_name}</p>
                                                            <p className="text-xs text-gray-500">{c.phone} · {c.email}</p>
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 bg-gray-50 px-4 py-3 rounded-xl text-center border border-dashed border-gray-300">
                                                    Không tìm thấy. <button type="button" onClick={() => setIsNewCustomer(true)} className="text-amber-600 font-semibold cursor-pointer">Tạo mới?</button>
                                                </div>
                                            )
                                        ) : (
                                            <p className="text-xs text-gray-400 text-center">Nhập tên hoặc số điện thoại để tìm kiếm.</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700">Họ và tên *</label>
                                            <div className="relative">
                                                <MdOutlinePersonOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                                <input type="text" value={guestForm.full_name} onChange={(e) => setGuestForm((f) => ({ ...f, full_name: e.target.value }))}
                                                    placeholder="Nguyễn Văn A" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
                                            <div className="relative">
                                                <MdOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                                <input type="tel" value={guestForm.phone} onChange={(e) => setGuestForm((f) => ({ ...f, phone: e.target.value }))}
                                                    placeholder="0901 234 567" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700">Email *</label>
                                            <div className="relative">
                                                <MdOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                                <input type="email" value={guestForm.email} onChange={(e) => setGuestForm((f) => ({ ...f, email: e.target.value }))}
                                                    placeholder="email@example.com" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700">CCCD / Hộ chiếu *</label>
                                            <div className="relative">
                                                <MdOutlineCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                                <input type="text" value={guestForm.id_card_number} onChange={(e) => setGuestForm((f) => ({ ...f, id_card_number: e.target.value }))}
                                                    placeholder="012345678901" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700">Ngày sinh *</label>
                                            <div className="relative">
                                                <MdOutlineCake className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                                <input type="date" value={guestForm.date_of_birth} onChange={(e) => setGuestForm((f) => ({ ...f, date_of_birth: e.target.value }))}
                                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700">Quốc tịch</label>
                                            <div className="relative">
                                                <MdOutlinePublic className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                                <input type="text" value={guestForm.nationality} onChange={(e) => setGuestForm((f) => ({ ...f, nationality: e.target.value }))}
                                                    placeholder="Việt Nam" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50" />
                                            </div>
                                        </div>
                                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                                            <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                                            <div className="relative">
                                                <MdOutlineHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                                <input type="text" value={guestForm.address} onChange={(e) => setGuestForm((f) => ({ ...f, address: e.target.value }))}
                                                    placeholder="Số nhà, đường, quận, thành phố..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Cảnh báo trùng lặp khách hàng */}
                                {isNewCustomer && duplicateCustomer && (
                                    <div className="flex flex-col gap-2 p-3.5 bg-amber-50 border-2 border-amber-400 rounded-xl">
                                        <div className="flex items-start gap-2">
                                            <svg className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-amber-800">Khách hàng đã tồn tại trong hệ thống!</p>
                                                <p className="text-xs text-amber-700 mt-0.5">
                                                    {(guestForm.phone.trim() && (duplicateCustomer.phone ?? '').replace(/\s+/g, '') === guestForm.phone.trim().replace(/\s+/g, ''))
                                                        ? `Số điện thoại ${guestForm.phone} đã được đăng ký.`
                                                        : `CCCD ${guestForm.id_card_number} đã được đăng ký.`
                                                    }
                                                </p>
                                                <div className="mt-2 p-2.5 bg-white rounded-lg border border-amber-200">
                                                    <p className="font-bold text-sm text-gray-800">{duplicateCustomer.full_name}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{duplicateCustomer.phone} · {duplicateCustomer.email}</p>
                                                    {duplicateCustomer.id_card_number && <p className="text-xs text-gray-400">CCCD: {duplicateCustomer.id_card_number}</p>}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsNewCustomer(false);
                                                setSelectedCustomer(duplicateCustomer);
                                                setDuplicateCustomer(null);
                                            }}
                                            className="w-full py-2 text-sm font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer border border-amber-300"
                                        >
                                            Dùng khách hàng này thay vì tạo mới
                                        </button>
                                    </div>
                                )}

                                <div className="flex justify-between pt-2">
                                    <button onClick={() => setStep(0)}
                                        className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                                        ← Quay lại
                                    </button>
                                    <button disabled={!step1Valid} onClick={() => setStep(2)}
                                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-xl transition-colors cursor-pointer">
                                        Xem xác nhận →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 - Xác nhận */}
                        {step === 2 && (
                            <div className="flex flex-col gap-4">
                                {/* Summary thời gian */}
                                <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Thời gian lưu trú</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bookingType === 'daily' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                            {bookingType === 'daily' ? 'Theo ngày' : 'Theo giờ'}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        {bookingType === 'daily' ? (
                                            <>
                                                <div><p className="text-gray-500">Nhận phòng</p><p className="font-semibold">{new Date(checkinAt).toLocaleDateString('vi-VN')}</p></div>
                                                <div><p className="text-gray-500">Trả phòng</p><p className="font-semibold">{new Date(checkoutAt).toLocaleDateString('vi-VN')}</p></div>
                                            </>
                                        ) : (
                                            <>
                                                <div><p className="text-gray-500">Ngày</p><p className="font-semibold">{bookingDate}</p></div>
                                                <div><p className="text-gray-500">Thời gian</p>
                                                    <p className="font-semibold">{startTime} — {(() => { const d = new Date(`${bookingDate}T${startTime}`); d.setHours(d.getHours() + durationHours); return d.toTimeString().slice(0, 5); })()} ({durationHours}h)</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        <span className="text-gray-500">Loại phòng: </span>
                                        <span className="font-semibold">{selectedRoomType?.name}</span>
                                        <span className="text-gray-400"> · {numGuests} khách{bookingType === 'daily' ? ` · ${nights} đêm` : ` · ${durationHours} giờ`}</span>
                                    </p>
                                </div>

                                {/* Summary khách hàng */}
                                <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Thông tin khách hàng</p>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div><p className="text-gray-500">Họ tên</p><p className="font-semibold">{selectedCustomer?.full_name ?? guestForm.full_name}</p></div>
                                        <div><p className="text-gray-500">Điện thoại</p><p className="font-semibold">{selectedCustomer?.phone ?? guestForm.phone}</p></div>
                                        <div className="col-span-2"><p className="text-gray-500">Email</p><p className="font-semibold">{selectedCustomer?.email ?? guestForm.email}</p></div>
                                        {(selectedCustomer?.id_card_number || guestForm.id_card_number) && (
                                            <div><p className="text-gray-500">CCCD</p><p className="font-semibold">{selectedCustomer?.id_card_number ?? guestForm.id_card_number}</p></div>
                                        )}
                                    </div>
                                </div>

                                {errorMsg && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{errorMsg}</div>
                                )}

                                <div className="flex justify-between pt-2">
                                    <button onClick={() => setStep(1)}
                                        className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
                                        ← Chỉnh sửa
                                    </button>
                                    <button disabled={submitting} onClick={handleCreateBooking}
                                        className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold px-8 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer">
                                        {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                                        {submitting ? 'Đang xử lý...' : 'Tiếp theo →'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3 - Thanh toán */}
                        {step === 3 && createdBooking && (
                            <div className="flex flex-col gap-5">
                                {/* Booking info header */}
                                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <IoCheckmarkCircle className="text-green-500 text-3xl shrink-0" />
                                    <div>
                                        <p className="font-bold text-green-800 text-base">Đặt phòng đã được tạo thành công!</p>
                                        <p className="text-sm text-green-600">Mã đặt phòng: <span className="font-bold">{createdBooking.booking_code}</span></p>
                                    </div>
                                </div>

                                {/* Charge breakdown */}
                                <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Chi tiết thanh toán</p>
                                    <div className="flex flex-col gap-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tổng tiền phòng</span>
                                            <span className="font-semibold text-gray-800">{formatVND(Number(createdBooking?.charge?.total ?? createdBooking?.total_amount ?? 0))}</span>
                                        </div>
                                        {Number(createdBooking?.charge?.discount ?? 0) > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Giảm giá</span>
                                                <span className="font-semibold text-green-600">- {formatVND(Number(createdBooking?.charge?.discount ?? 0))}</span>
                                            </div>
                                        )}
                                        {Number(createdBooking?.charge?.deposited ?? 0) > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Đã đặt cọc</span>
                                                <span className="font-semibold text-blue-600">- {formatVND(Number(createdBooking?.charge?.deposited ?? 0))}</span>
                                            </div>
                                        )}
                                        <div className="border-t border-gray-200 pt-2 mt-1 flex justify-between">
                                            <span className="font-bold text-gray-800">Cần thanh toán</span>
                                            <span className="font-bold text-xl text-amber-600">{formatVND(Number(createdBooking?.charge?.balance ?? createdBooking?.charge?.total ?? 0))}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment options */}
                                <div className="flex flex-col gap-3">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Chọn hình thức thanh toán</p>

                                    {/* Thanh toán tiền mặt */}
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handlePayCash}
                                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-green-200 bg-green-50 hover:border-green-500 hover:bg-green-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                            <BsCash className="text-green-600 text-xl" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-green-800 text-sm">Thanh toán tại quầy</p>
                                            <p className="text-xs text-green-600">Khách thanh toán tiền mặt ngay bây giờ</p>
                                        </div>
                                        <span className="text-green-700 font-bold text-sm">{formatVND(Number(createdBooking?.charge?.balance ?? createdBooking?.charge?.total ?? 0))}</span>
                                    </button>

                                    {/* ZaloPay */}
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handlePayZaloPay}
                                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-blue-200 bg-blue-50 hover:border-blue-500 hover:bg-blue-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                            <SiZalo className="text-blue-600 text-xl" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-blue-800 text-sm">Thanh toán ZaloPay</p>
                                            <p className="text-xs text-blue-600">Chuyển hướng đến cổng thanh toán ZaloPay</p>
                                        </div>
                                        <span className="text-blue-700 font-bold text-sm">{formatVND(Number(createdBooking?.charge?.balance ?? createdBooking?.charge?.total ?? 0))}</span>
                                    </button>

                                    {/* Nhận phòng chưa thanh toán */}
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handleCheckinUnpaid}
                                        className="flex items-center gap-4 p-4 rounded-xl border-2 border-amber-200 bg-amber-50 hover:border-amber-500 hover:bg-amber-100 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                            <MdOutlineHotel className="text-amber-600 text-xl" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold text-amber-800 text-sm">Nhận phòng chưa thanh toán</p>
                                            <p className="text-xs text-amber-600">Khách sẽ thanh toán sau khi trả phòng</p>
                                        </div>
                                    </button>
                                </div>

                                {/* Cancel */}
                                <div className="pt-1">
                                    <button
                                        type="button"
                                        disabled={submitting}
                                        onClick={handleCancelBooking}
                                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-red-200 text-red-500 hover:border-red-400 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                                    >
                                        {submitting && <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />}
                                        <MdOutlineCancel className="text-lg" />
                                        Hủy đặt phòng
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
};

export default StaffBookingModal;
