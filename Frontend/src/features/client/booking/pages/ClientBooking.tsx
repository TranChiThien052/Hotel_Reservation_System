import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomsApi } from '@/features/admin/adminRooms/api/rooms-api';
import { roomTypesApi } from '@/features/admin/adminRoomTypes/api/roomTypes-api';
import { roomPricesApi } from '@/features/admin/adminRoomsPrices/api/roomPrices-api';
import { promotionApi } from '@/features/admin/adminPromitions/api/promotion-api';
import { bookingApi } from '@/features/staff/staffBooking/api/booking-api';
import { customersApi } from '@/features/admin/adminCustomers/api/customers-api';
import type { RoomItem, RoomImage, RoomType, RoomPrice } from '@/app/layout/components/client/room';
import { useAppSelector } from '@/app/store/hooks';
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import { FaRegCalendarAlt, FaRegUser, FaTag } from 'react-icons/fa';
import {
    MdOutlinePhone, MdOutlineMail, MdOutlinePersonOutline,
    MdOutlineNotes, MdOutlineCreditCard, MdOutlinePublic,
    MdOutlineCake, MdOutlineHome,
} from 'react-icons/md';
import fallbackImg from '@/assets/images/Deluxe.jpg';
import type { Customer } from '@/features/admin/adminCustomers/types/customers-type';
import type { Promotion } from '@/features/admin/adminPromitions/types/promotions-types';


const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const diffDays = (from: string, to: string): number => {
    if (!from || !to) return 0;
    const ms = new Date(to).getTime() - new Date(from).getTime();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

// const todayStr = () => new Date().toISOString().split('T')[0];

const todayStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
}
const tomorrowStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
};


const steps = ['Chọn ngày', 'Thông tin', 'Xác nhận'];

const StepBar = ({ current }: { current: number }) => (
    <div className="flex items-center gap-0 mb-10">
        {steps.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                        i < current
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : i === current
                                ? 'bg-white border-amber-500 text-amber-600'
                                : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                        {i < current ? <IoCheckmarkCircle className="text-lg" /> : i + 1}
                    </div>
                    <span className={`text-xs mt-1 font-medium ${
                        i === current ? 'text-amber-600' : i < current ? 'text-amber-500' : 'text-gray-400'
                    }`}>
                        {label}
                    </span>
                </div>
                {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 mt-3.5 transition-colors ${i < current ? 'bg-amber-500' : 'bg-gray-200'}`} />
                )}
            </div>
        ))}
    </div>
);


const ClientBooking = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const authUser = useAppSelector((state) => state.auth.user);
    const isLoggedIn = !!authUser;
    
    const existingCustomer = authUser?.customers ?? null;
    const loggedInCustomerId = existingCustomer?.id ?? null;
    const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);

    const [room, setRoom] = useState<RoomItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Hình thức thanh toán
    const [paymentMode, setPaymentMode] = useState<'full' | 'deposit'>('full');

    
    const [discount, setDiscount] = useState<{
        id: string;
        discount_type: string;
        discount_value: number;
        min_order_value: number;
        label: string;
    } | null>(null);
    const [discountCode, setDiscountCode] = useState('');
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState('');

    
    const [booking_type, setBookingType] = useState<'daily' | 'hourly'>('daily');

    
    const [checkin_at, setCheckinAt] = useState(todayStr());
    const [checkout_at, setCheckoutAt] = useState(tomorrowStr());

    
    const getCurrentTime = () => {
      const now = new Date();
      now.setHours(now.getHours() + 2); // Thêm 2 giờ để tránh chọn giờ đã qua
      now.setMinutes(0, 0, 0); // Đặt phút, giây và mili giây về 0
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`; 
    };
    const [bookingDate, setBookingDate] = useState(todayStr());
    const [startTime, setStartTime] = useState(getCurrentTime());
    const [durationHours, setDurationHours] = useState(2);

    const [num_guests, setNumGuests] = useState(1);

    // Tính checkin/checkout
    const hourlyCheckin = `${bookingDate}T${startTime}:00`;
    const hourlyCheckout = (() => {
      const d = new Date(`${bookingDate}T${startTime}:00`);
      d.setHours(d.getHours() + durationHours);
      const pad = (num: number) => String(num).padStart(2, "0");

      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const date = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      const seconds = pad(d.getSeconds());

      return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}.000`;
    })();
    console.log("authUser", authUser);

    // Thông tin khách hàng — pre-fill từ authUser.customers nếu đã có
    const [guestForm, setGuestForm] = useState({
        full_name: authUser?.customers?.full_name ?? '',
        phone: authUser?.customers?.phone ?? '',
        email: '',
        id_card_number: '',
        nationality: 'Việt Nam',
        date_of_birth: '',
        address: '',
    });

   
    const [notes, setNotes] = useState('');


    const fetchRoom = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [roomData, roomTypesData, roomPricesData] = await Promise.all([
                roomsApi.getRoomById(id),
                roomTypesApi.getRoomTypes(),
                roomPricesApi.getAllRoomprices(),
            ]);
            const rtList: RoomType[] = Array.isArray(roomTypesData) ? roomTypesData : [];
            const rpList: RoomPrice[] = Array.isArray(roomPricesData) ? roomPricesData : [];
            const rtMap = new Map<string, RoomType>(rtList.map((r) => [r.id, r]));
            const rtFromApi = roomData.room_types ?? {};
            const rtFull = rtMap.get(roomData.room_type_id) ?? rtFromApi;
            setRoom({
                ...roomData,
                room_types: { ...rtFromApi, roomImages: rtFull.roomImages ?? [] },
                room_price: rpList.find((rp: any) => rp.room_type_id === roomData.room_type_id) ?? null,
            });
        } catch (err) {
            console.error('Lỗi khi lấy thông tin phòng:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchCustomerProfile = useCallback(async () => {
        if (!authUser?.customers?.id) return;
        try {
            const profile = await customersApi.getCustomerById(authUser.customers.id);
            setCustomerProfile(profile);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin khách hàng:", error);
        }
    }, [authUser?.customers?.id]);

    useEffect(() => { fetchRoom(); }, [fetchRoom]);
    useEffect(() => { fetchCustomerProfile(); }, [fetchCustomerProfile]);
    console.log("customerProfile", customerProfile);

    const handleApplyDiscount = async () => {
        if (!discountCode.trim()) return;
        setDiscountLoading(true);
        setDiscountError('');
        setDiscount(null);
        try {
            const list: Promotion[] = await promotionApi.getPromotions();
            console.log("list", list);
            const found = list.find(
                (p: Promotion) => p.code?.toLowerCase() === discountCode.trim().toLowerCase() 
                && new Date(p.valid_to) >= new Date() 
                && new Date(p.valid_from) <= new Date()
                && p.is_active
                && p.branch_id === room?.branch_id
            );
            if (found) {
                const minOrderValue = Number(found.min_order_value ?? 0);
                // Kiểm tra giá trị đơn hàng tối thiểu
                if (minOrderValue > 0 && subtotal > 0 && subtotal < minOrderValue) {
                    setDiscountError(
                        `Đơn hàng tối thiểu để dùng mã này là ${formatVND(minOrderValue)}. Giá trị hiện tại: ${formatVND(subtotal)}.`
                    );
                    setDiscountLoading(false);
                    return;
                }
                setDiscount({
                    id: found.id,
                    discount_type: found.discount_type,
                    discount_value: Number(found.discount_value ?? 0),
                    min_order_value: minOrderValue,
                    label: found.code,
                });
            } else {
                setDiscountError('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
            }
        } catch {
            setDiscountError('Không thể kiểm tra mã giảm giá. Vui lòng thử lại.');
        } finally {
            setDiscountLoading(false);
        }
    };

    
    const nights = booking_type === 'daily' ? diffDays(checkin_at, checkout_at) : 0;
    const pricePerNight = room?.room_price?.price_per_day ? Number(room.room_price.price_per_day) : 0;
    const pricePerHour = room?.room_price?.price_per_hour ? Number(room.room_price.price_per_hour) : 0;

    const calculateSubtotal = () => {
      
    }

    const subtotal = booking_type === 'daily'
        ? pricePerNight * nights
        : pricePerHour * durationHours;
    // Kiểm tra điều kiện đơn hàng tối thiểu
    const discountEligible = !discount || discount.min_order_value <= 0 || subtotal >= discount.min_order_value;
    const discountAmount = discount && discountEligible
        ? discount.discount_type === 'percentage'
            ? Math.round(subtotal * discount.discount_value / 100)
            : Math.min(discount.discount_value, subtotal)
        : 0;
    const total = subtotal - discountAmount;

    const step0Valid = booking_type === 'daily'
        ? nights > 0 && num_guests >= 1
        : bookingDate !== '' && startTime !== '' && durationHours >= 1 && num_guests >= 1;

    // Nếu đã có customer → hợp lệ luôn; nếu chưa → cần nhập đủ thông tin
    const step1Valid = existingCustomer
        ? true
        : guestForm.full_name.trim() !== '' &&
          guestForm.phone.trim() !== '' &&
          guestForm.email.trim() !== '' &&
          guestForm.id_card_number.trim() !== '' &&
          guestForm.date_of_birth !== '';

    const handleSubmit = async () => {
        if (!room) return;
        setSubmitting(true);
        setErrorMsg('');
        try {
            let customerId = loggedInCustomerId;

            // Đã đăng nhập nhưng chưa có customer profile → tạo mới và gắn account_id
            if (!customerId) {
                const newCustomer = await customersApi.createCustomer({
                    full_name: guestForm.full_name,
                    phone: guestForm.phone,
                    email: guestForm.email,
                    id_card_number: guestForm.id_card_number,
                    nationality: guestForm.nationality,
                    date_of_birth: guestForm.date_of_birth,
                    address: guestForm.address || undefined,
                    account_id: authUser?.id,  // gắn account_id để lần sau tự load
                });
                customerId = newCustomer?.id ?? newCustomer?.data?.id;
            }

            if (!customerId) {
                throw new Error('Không thể lấy thông tin khách hàng.');
            }

            const finalCheckin = booking_type === 'daily' ? checkin_at : hourlyCheckin;
            const finalCheckout = booking_type === 'daily' ? checkout_at : hourlyCheckout;

            await bookingApi.createBooking({
                room_id: room.id,
                room_type_id: room.room_type_id,
                branch_id: room.branch_id,
                customer_id: customerId,
                booking_type,
                status: 'pending',
                checkin_at: finalCheckin,
                checkout_at: finalCheckout,
                num_guests,
                discount_id: discount?.id ?? null,
                notes: notes || undefined,
            } as any);

            const depositAmount = Math.round(total * 0.3);
            navigate('/booking/success', {
                state: {
                    roomTypeName: room.room_types?.name,
                    checkin: finalCheckin,
                    checkout: finalCheckout,
                    numGuests: num_guests,
                    total,
                    depositAmount,
                    paymentMode,
                    bookingType: booking_type,
                    nights: booking_type === 'daily' ? nights : undefined,
                    durationHours: booking_type === 'hourly' ? durationHours : undefined,
                },
            });
        } catch (err: any) {
            console.error('Lỗi đặt phòng:', err);
            setErrorMsg(err?.response?.data?.message ?? 'Đặt phòng thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    console.log("room", room);

    if (!isLoggedIn) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
                    <FaRegUser className="text-amber-500 text-4xl" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Yêu cầu đăng nhập</h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                    Bạn cần <span className="font-semibold text-amber-600">đăng nhập</span> để tiếp tục đặt phòng.<br />
                    Sau khi đăng nhập, bạn sẽ được chuyển trở lại trang này.
                </p>
                <button
                    onClick={() => navigate(`/login?returnUrl=/booking/${id}`)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                    Đăng nhập ngay
                </button>
                <button
                    onClick={() => navigate('/rooms')}
                    className="text-sm text-gray-400 hover:text-gray-600 underline"
                >
                    Quay lại danh sách phòng
                </button>
            </div>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500">Đang tải thông tin phòng...</p>
            </div>
        </div>
    );

    if (!room) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy phòng</p>
                <button onClick={() => navigate('/rooms')} className="mt-4 text-amber-600 underline cursor-pointer">
                    Quay lại danh sách phòng
                </button>
            </div>
        </div>
    );

    const roomType = room.room_types;
    const images: RoomImage[] = roomType?.roomImages ?? [];
    const imgSrc = images.length > 0 ? images[0].image_url : fallbackImg;

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate("/rooms")}
            className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-6 group "
          >
            <IoArrowBack className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium cursor-pointer">
              Quay lại danh sách phòng
            </span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Đặt phòng</h1>

          <StepBar current={step} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {step === 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FaRegCalendarAlt className="text-amber-500" /> Chọn loại &
                    thời gian đặt phòng
                  </h2>

                  {/* ── Loại đặt phòng ── */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Loại đặt phòng
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Theo ngày */}
                      <button
                        type="button"
                        onClick={() => setBookingType("daily")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          booking_type === "daily"
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <FaRegCalendarAlt className="text-2xl" />
                        <div className="text-center">
                          <p className="font-bold text-sm">Theo ngày</p>
                          <p className="text-xs mt-0.5 opacity-70">
                            {pricePerNight > 0
                              ? formatVND(pricePerNight) + " / đêm"
                              : "Liên hệ"}
                          </p>
                        </div>
                        {booking_type === "daily" && (
                          <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                            Đang chọn
                          </span>
                        )}
                      </button>

                      {/* Theo giờ */}
                      <button
                        type="button"
                        onClick={() => setBookingType("hourly")}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          booking_type === "hourly"
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        <svg
                          className="text-2xl w-6 h-6"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          <path
                            d="M12 6v6l4 2"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="text-center">
                          <p className="font-bold text-sm">Theo giờ</p>
                          <p className="text-xs mt-0.5 opacity-70">
                            {pricePerHour > 0
                              ? formatVND(pricePerHour) + " / giờ"
                              : "Liên hệ"}
                          </p>
                        </div>
                        {booking_type === "hourly" && (
                          <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">
                            Đang chọn
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  {booking_type === "daily" ? (
                    <div className="flex flex-col gap-4 ">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Ngày nhận phòng
                          </label>
                          <input
                            type="date"
                            value={checkin_at}
                            min={todayStr()}
                            onChange={(e) => {
                              setCheckinAt(e.target.value);
                              if (e.target.value >= checkout_at)
                                setCheckoutAt("");
                            }}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Ngày trả phòng
                          </label>
                          <input
                            type="date"
                            value={checkout_at}
                            min={checkin_at || todayStr()}
                            onChange={(e) => setCheckoutAt(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 cursor-pointer"
                          />
                        </div>
                      </div>
                      {nights > 0 && (
                        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
                          <FaRegCalendarAlt />
                          <span>
                            Thời gian lưu trú: <strong>{nights} đêm</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Ngày đặt
                          </label>
                          <input
                            type="date"
                            value={bookingDate}
                            min={todayStr()}
                            onChange={(e) => setBookingDate(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 cursor-pointer"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Giờ bắt đầu
                          </label>
                          <input
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 cursor-pointer"
                          />
                        </div>
                      </div>
                      {/* Số giờ */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          Số giờ thuê
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              setDurationHours((h) => Math.max(1, h - 1))
                            }
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 transition-colors font-bold cursor-pointer"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-800">
                            {durationHours}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setDurationHours((h) => Math.min(24, h + 1))
                            }
                            className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 transition-colors font-bold cursor-pointer"
                          >
                            +
                          </button>
                          <span className="text-sm text-gray-400">
                            giờ (tối đa 24 giờ)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-xl">
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth="2" />
                          <path
                            d="M12 6v6l4 2"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        <span>
                          Từ <strong>{startTime}</strong> — đến{" "}
                          <strong>
                            {(() => {
                              const d = new Date(`${bookingDate}T${startTime}`);
                              d.setHours(d.getHours() + durationHours);
                              return d.toTimeString().slice(0, 5);
                            })()}
                          </strong>{" "}
                          ({durationHours} giờ)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <FaRegUser className="text-gray-400" /> Số khách
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setNumGuests((g) => Math.max(1, g - 1))}
                        className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 transition-colors font-bold cursor-pointer"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-800">
                        {num_guests}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setNumGuests((g) =>
                            Math.min(roomType?.max_guests ?? 10, g + 1),
                          )
                        }
                        className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-lg hover:bg-gray-100 transition-colors font-bold cursor-pointer"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-400">
                        / tối đa {roomType?.max_guests} khách
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      disabled={!step0Valid}
                      onClick={() => setStep(1)}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Tiếp theo →
                    </button>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MdOutlinePersonOutline className="text-amber-500 text-xl" />{" "}
                    Thông tin khách hàng
                  </h2>

                  {/* Đã có customer profile: hiển thị thông tin */}
                  {existingCustomer ? (
                    <div className="flex flex-col gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-700 text-sm font-medium mb-1">
                        <IoCheckmarkCircle className="text-lg" />
                        Đặt phòng với tài khoản đã đăng nhập
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs">Họ tên</p>
                          <p className="font-semibold text-gray-800">
                            {customerProfile?.full_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Điện thoại</p>
                          <p className="font-semibold text-gray-800">
                            {customerProfile?.phone}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Email</p>
                          <p className="font-semibold text-gray-800">
                            {customerProfile?.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">CCCD/CMND</p>
                          <p className="font-semibold text-gray-800">
                            {customerProfile?.id_card_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Quốc tịch</p>
                          <p className="font-semibold text-gray-800">
                            {customerProfile?.nationality}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Ngày sinh</p>
                          <p className="font-semibold text-gray-800">
                            {customerProfile?.date_of_birth
                              ? new Date(
                                  customerProfile.date_of_birth,
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                        <span>⚠️</span>
                        <span>
                          Tài khoản của bạn chưa có hồ sơ khách hàng. Vui lòng
                          nhập thông tin dưới đây — thông tin sẽ được lưu cho
                          những lần đặt phòng tiếp theo.
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Họ và tên *
                          </label>
                          <div className="relative">
                            <MdOutlinePersonOutline className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                              type="text"
                              value={guestForm.full_name}
                              onChange={(e) =>
                                setGuestForm((f) => ({
                                  ...f,
                                  full_name: e.target.value,
                                }))
                              }
                              placeholder="Nguyễn Văn A"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Số điện thoại *
                          </label>
                          <div className="relative">
                            <MdOutlinePhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                              type="tel"
                              value={guestForm.phone}
                              onChange={(e) =>
                                setGuestForm((f) => ({
                                  ...f,
                                  phone: e.target.value,
                                }))
                              }
                              placeholder="0901 234 567"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Email *
                          </label>
                          <div className="relative">
                            <MdOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                              type="email"
                              value={guestForm.email}
                              onChange={(e) =>
                                setGuestForm((f) => ({
                                  ...f,
                                  email: e.target.value,
                                }))
                              }
                              placeholder="email@example.com"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Số CCCD / Hộ chiếu *
                          </label>
                          <div className="relative">
                            <MdOutlineCreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                              type="text"
                              value={guestForm.id_card_number}
                              onChange={(e) =>
                                setGuestForm((f) => ({
                                  ...f,
                                  id_card_number: e.target.value,
                                }))
                              }
                              placeholder="012345678901"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Ngày sinh *
                          </label>
                          <div className="relative">
                            <MdOutlineCake className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                              type="date"
                              value={guestForm.date_of_birth}
                              onChange={(e) =>
                                setGuestForm((f) => ({
                                  ...f,
                                  date_of_birth: e.target.value,
                                }))
                              }
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Quốc tịch
                          </label>
                          <div className="relative">
                            <MdOutlinePublic className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                              type="text"
                              value={guestForm.nationality}
                              onChange={(e) =>
                                setGuestForm((f) => ({
                                  ...f,
                                  nationality: e.target.value,
                                }))
                              }
                              placeholder="Việt Nam"
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-2 flex flex-col gap-1.5">
                          <label className="text-sm font-medium text-gray-700">
                            Địa chỉ
                          </label>
                          <div className="relative">
                            <MdOutlineHome className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                              type="text"
                              value={guestForm.address}
                              onChange={(e) =>
                                setGuestForm((f) => ({
                                  ...f,
                                  address: e.target.value,
                                }))
                              }
                              placeholder="Số nhà, đường, quận, thành phố..."
                              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <MdOutlineNotes className="text-gray-400" /> Ghi chú
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Yêu cầu đặc biệt, giờ nhận phòng dự kiến..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 resize-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                      <FaTag className="text-gray-400" /> Mã giảm giá
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value);
                          setDiscount(null);
                          setDiscountError("");
                        }}
                        placeholder="Nhập mã khuyến mãi..."
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50 uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={discountLoading || !discountCode.trim()}
                        className="px-5 py-2.5 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                      >
                        {discountLoading ? "..." : "Áp dụng"}
                      </button>
                    </div>
                    {discount?.discount_type === "percentage" ? (
                      <p className="text-green-600 text-xs flex items-center gap-1.5">
                        <IoCheckmarkCircle /> Áp dụng thành công: Giảm{" "}
                        {discount.discount_value}%
                      </p>
                    ) : discount?.discount_type === "fixed_amount" ? (
                      <p className="text-green-600 text-xs flex items-center gap-1.5">
                        <IoCheckmarkCircle /> Áp dụng thành công: Giảm{" "}
                        {formatVND(discount.discount_value)}
                      </p>
                    ) : null}
                    {discountError && (
                      <p className="text-red-500 text-xs">{discountError}</p>
                    )}
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(0)}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      ← Quay lại
                    </button>
                    <button
                      disabled={!step1Valid}
                      onClick={() => setStep(2)}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Xem xác nhận →
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
                  <h2 className="text-lg font-bold text-gray-900">
                    Xác nhận thông tin đặt phòng
                  </h2>

                  <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Thời gian lưu trú
                      </p>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          booking_type === "daily"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {booking_type === "daily" ? "Theo ngày" : "Theo giờ"}
                      </span>
                    </div>
                    {booking_type === "daily" ? (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Nhận phòng</p>
                          <p className="font-semibold text-gray-800">
                            {new Date(checkin_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">Từ 14:00</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Trả phòng</p>
                          <p className="font-semibold text-gray-800">
                            {new Date(checkout_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">Trước 12:00</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Ngày</p>
                          <p className="font-semibold text-gray-800">
                            {bookingDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Thời gian</p>
                          <p className="font-semibold text-gray-800">
                            {startTime} —{" "}
                            {(() => {
                              const d = new Date(`${bookingDate}T${startTime}`);
                              d.setHours(d.getHours() + durationHours);
                              return d.toTimeString().slice(0, 5);
                            })()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {durationHours} giờ
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="text-gray-500">Số khách: </span>
                      <span className="font-semibold">{num_guests} người</span>
                      {booking_type === "daily" && (
                        <span className="text-gray-400"> · {nights} đêm</span>
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Thông tin khách hàng
                    </p>
                    {isLoggedIn && authUser?.customers ? (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Họ tên</p>
                          <p className="font-semibold">
                            {authUser.customers.full_name}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Điện thoại</p>
                          <p className="font-semibold">
                            {authUser.customers.phone}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Họ tên</p>
                          <p className="font-semibold">{guestForm.full_name}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Điện thoại</p>
                          <p className="font-semibold">{guestForm.phone}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-gray-500">Email</p>
                          <p className="font-semibold">{guestForm.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">CCCD</p>
                          <p className="font-semibold">
                            {guestForm.id_card_number}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Quốc tịch</p>
                          <p className="font-semibold">
                            {guestForm.nationality}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hình thức thanh toán */}
                  <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Hình thức thanh toán
                    </p>
                    <div className="flex flex-col gap-2">
                      <label
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMode === "full" ? "border-amber-500 bg-amber-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          value="full"
                          checked={paymentMode === "full"}
                          onChange={() => setPaymentMode("full")}
                          className="accent-amber-500 w-4 h-4"
                        />
                        <div className="flex-1">
                          <p
                            className={`font-semibold text-sm ${paymentMode === "full" ? "text-amber-700" : "text-gray-700"}`}
                          >
                            Thanh toán toàn bộ
                          </p>
                          <p className="text-xs text-gray-400">
                            Thanh toán 100% — {formatVND(total)}
                          </p>
                        </div>
                        {paymentMode === "full" && (
                          <IoCheckmarkCircle className="text-amber-500 text-xl shrink-0" />
                        )}
                      </label>
                      <label
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${paymentMode === "deposit" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                      >
                        <input
                          type="radio"
                          name="paymentMode"
                          value="deposit"
                          checked={paymentMode === "deposit"}
                          onChange={() => setPaymentMode("deposit")}
                          className="accent-blue-500 w-4 h-4"
                        />
                        <div className="flex-1">
                          <p
                            className={`font-semibold text-sm ${paymentMode === "deposit" ? "text-blue-700" : "text-gray-700"}`}
                          >
                            Đặt cọc 30%
                          </p>
                          <p className="text-xs text-gray-400">
                            Đặt cọc — {formatVND(Math.round(total * 0.3))} · Còn
                            lại thanh toán khi nhận phòng
                          </p>
                        </div>
                        {paymentMode === "deposit" && (
                          <IoCheckmarkCircle className="text-blue-500 text-xl shrink-0" />
                        )}
                      </label>
                    </div>
                  </div>

                  {booking_type === "daily" ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 leading-relaxed">
                      <p className="font-semibold mb-1">Chính sách hủy phòng</p>
                      <p>
                        Miễn phí hủy trong vòng 24 giờ sau khi đặt. Hủy sau thời
                        hạn sẽ bị tính phí 1 đêm đầu.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 leading-relaxed">
                      <p className="font-semibold mb-1">Chính sách hủy phòng</p>
                      <p>
                        KHÔNG hoàn tiền nếu hủy đặt phòng theo giờ. Vui lòng liên hệ với chúng tôi để được hỗ trợ nếu có thay đổi về thời gian đặt phòng.
                      </p>
                    </div>
                  )}

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      ← Chỉnh sửa
                    </button>
                    <button
                      disabled={submitting}
                      onClick={handleSubmit}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-bold px-8 py-2.5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {submitting && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {submitting ? "Đang xử lý..." : "Xác nhận đặt phòng"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Booking summary card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-24 flex flex-col gap-4">
                {/* Room type thumbnail */}
                <div className="flex gap-3 items-start">
                  <img
                    src={imgSrc}
                    alt={roomType?.name}
                    className="w-20 h-16 object-cover rounded-xl shrink-0"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      {roomType?.name}
                    </span>
                    <p className="font-bold text-gray-900 text-sm mt-1">
                      Phòng {roomType?.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                      <FaRegUser />
                      <span>Tối đa {roomType?.max_guests} khách</span>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Price */}
                <div className="flex flex-col gap-2 text-sm">
                  {booking_type === "daily" ? (
                    <div className="flex justify-between text-gray-600">
                      <span>
                        {formatVND(pricePerNight)} × {nights || "?"} đêm
                      </span>
                      <span>{nights > 0 ? formatVND(subtotal) : "—"}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-gray-600">
                      <span>
                        {formatVND(pricePerHour)} × {durationHours} giờ
                      </span>
                      <span>{formatVND(subtotal)}</span>
                    </div>
                  )}
                  {discount && discountEligible && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <FaTag className="text-xs" />
                        {discount.discount_type === "percentage"
                          ? `Giảm ${discount.discount_value}% (${discount.label})`
                          : `Giảm cố định (${discount.label})`}
                      </span>
                      <span>− {formatVND(discountAmount)}</span>
                    </div>
                  )}
                  {discount && !discountEligible && (
                    <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-2">
                      <FaTag className="shrink-0" />
                      <span>
                        Mã <strong>{discount.label}</strong> yêu cầu đơn tối
                        thiểu{" "}
                        <strong>{formatVND(discount.min_order_value)}</strong>.
                        Đơn hiện tại chưa đủ điều kiện.
                      </span>
                    </div>
                  )}
                </div>

                <hr className="border-gray-100" />

                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Tổng cộng</span>
                  <span className="font-bold text-xl text-amber-500">
                    {nights > 0
                      ? formatVND(total)
                      : durationHours > 0
                        ? formatVND(total)
                        : "—"}
                  </span>
                </div>

                <p className="text-xs text-gray-400 text-center">
                  Đã bao gồm thuế và phí dịch vụ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ClientBooking;
