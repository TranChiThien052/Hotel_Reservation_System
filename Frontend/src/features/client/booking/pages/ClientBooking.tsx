import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { roomsApi } from "@/features/admin/adminRooms/api/rooms-api";
import { roomTypesApi } from "@/features/admin/adminRoomTypes/api/roomTypes-api";
import { roomPricesApi } from "@/features/admin/adminRoomsPrices/api/roomPrices-api";
import { promotionApi } from "@/features/admin/adminPromitions/api/promotion-api";
import { bookingApi } from "@/features/staff/staffBooking/api/booking-api";
import { customersApi } from "@/features/admin/adminCustomers/api/customers-api";
import { roomsAvailableApi } from "@/features/client/rooms/api/rooms-api";
import { servicesApi } from "@/features/admin/adminServices/api/services-api";
import type { Service } from "@/features/admin/adminServices/types/services-type";
import type {
  RoomItem,
  RoomImage,
  RoomType,
  RoomPrice,
} from "@/app/layout/components/client/room";
import { useAppSelector } from "@/app/store/hooks";
import { IoArrowBack, IoCheckmarkCircle } from "react-icons/io5";
import { FaRegCalendarAlt, FaRegUser, FaTag } from "react-icons/fa";
import { message } from "antd";
import {
  MdOutlinePhone,
  MdOutlineMail,
  MdOutlinePersonOutline,
  MdOutlineNotes,
  MdOutlineCreditCard,
  MdOutlinePublic,
  MdOutlineCake,
  MdOutlineHome,
  MdOutlineEdit,
} from "react-icons/md";
import fallbackImg from "@/assets/images/Deluxe.jpg";
import type { Customer, CustomerFormData } from "@/features/admin/adminCustomers/types/customers-type";
import type { Promotion } from "@/features/admin/adminPromitions/types/promotions-types";
import { paymentApi } from "../api/payment-api";
import { bookingServiceApi } from "@/features/staff/staffBooking/api/booking-service-api";

const formatVND = (n: number) => n.toLocaleString("vi-VN") + "đ";

const diffDays = (from: string, to: string): number => {
  if (!from || !to) return 0;
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
};

// const todayStr = () => new Date().toISOString().split('T')[0];

const todayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};
const tomorrowStr = () => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split("T")[0];
};

const steps = ["Chọn ngày", "Thông tin", "Xác nhận"];

const StepBar = ({ current }: { current: number }) => (
  <div className="flex items-center gap-0 mb-10">
    {steps.map((label, i) => (
      <div key={i} className="flex items-center flex-1 last:flex-none">
        <div className="flex flex-col items-center">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
              i < current
                ? "bg-amber-500 border-amber-500 text-white"
                : i === current
                  ? "bg-white border-amber-500 text-amber-600"
                  : "bg-white border-gray-300 text-gray-400"
            }`}
          >
            {i < current ? <IoCheckmarkCircle className="text-lg" /> : i + 1}
          </div>
          <span
            className={`text-xs mt-1 font-medium ${
              i === current
                ? "text-amber-600"
                : i < current
                  ? "text-amber-500"
                  : "text-gray-400"
            }`}
          >
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div
            className={`flex-1 h-0.5 mx-2 mt-3.5 transition-colors ${i < current ? "bg-amber-500" : "bg-gray-200"}`}
          />
        )}
      </div>
    ))}
  </div>
);

const ClientBooking = () => {
  const { id, typeId } = useParams<{ id?: string; typeId?: string }>();
  const navigate = useNavigate();

  const isByType = !!typeId && !id;

  const authUser = useAppSelector((state) => state.auth.user);
  const isLoggedIn = !!authUser;

  const existingCustomer = authUser?.customers ?? null;
  const loggedInCustomerId = existingCustomer?.id ?? null;
  const [customerProfile, setCustomerProfile] = useState<Customer | null>(null);

  // States cho tính năng chỉnh sửa thông tin khách hàng
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [editCustomerForm, setEditCustomerForm] = useState<CustomerFormData | null>(null);

  const [room, setRoom] = useState<RoomItem | null>(null);
  const [loading, setLoading] = useState(!isByType);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingServices, setBookingServices] = useState<
    { service: Service; quantity: number }[]
  >([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [calculatingPrice, setCalculatingPrice] = useState(false);

  // State kiểm tra phòng trống (chỉ dùng khi isByType)
  const [availabilityChecking, setAvailabilityChecking] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  // Hình thức thanh toán
  const [paymentMode, setPaymentMode] = useState<"full" | "deposit">("full");

  const [discount, setDiscount] = useState<{
    id: string;
    discount_type: string;
    discount_value: number;
    min_order_value: number;
    label: string;
  } | null>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState("");

  const [booking_type, setBookingType] = useState<"daily" | "hourly">("daily");

  const [checkin_at, setCheckinAt] = useState(todayStr());
  const [checkout_at, setCheckoutAt] = useState(tomorrowStr());

  const getCurrentTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Thêm 2 giờ để tránh chọn giờ đã qua
    now.setMinutes(0, 0, 0); // Đặt phút, giây và mili giây về 0
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
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

    return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`;
  })();
  console.log("authUser", authUser);

  // Thông tin khách hàng — pre-fill từ authUser.customers nếu đã có
  const [guestForm, setGuestForm] = useState({
    full_name: authUser?.customers?.full_name ?? "",
    phone: authUser?.customers?.phone ?? "",
    email: "",
    id_card_number: "",
    nationality: "Việt Nam",
    date_of_birth: "",
    address: "",
  });

  const [notes, setNotes] = useState("");

  const fetchRoom = useCallback(async () => {
    // Nếu theo typeId, sẽ load room type info (không cần specific roomId)
    if (isByType && typeId) {
      setLoading(true);
      try {
        const [rtData, allPrices] = await Promise.all([
          roomTypesApi.getRoomTypeById(typeId),
          roomPricesApi.getAllRoomprices(),
        ]);
        const rpList: RoomPrice[] = Array.isArray(allPrices) ? allPrices : [];
        const foundPrice =
          rpList.find((rp: any) => rp.room_type_id === typeId) ?? null;
        // Tạo 1 RoomItem giả để tái dùng UI (room_types, room_price)
        setRoom({
          id: "",
          room_number: "",
          floor: 0,
          status: "available",
          branch_id: rtData.branch_id ?? "",
          room_type_id: typeId,
          room_types: { ...rtData, roomImages: rtData.roomImages ?? [] },
          room_price: foundPrice,
        } as any);
      } catch (err) {
        console.error("Lỗi khi lấy thông tin loại phòng:", err);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!id) return;
    setLoading(true);
    try {
      const [roomData, roomTypesData, roomPricesData] = await Promise.all([
        roomsApi.getRoomById(id),
        roomTypesApi.getRoomTypes(),
        roomPricesApi.getAllRoomprices(),
      ]);
      const rtList: RoomType[] = Array.isArray(roomTypesData)
        ? roomTypesData
        : [];
      const rpList: RoomPrice[] = Array.isArray(roomPricesData)
        ? roomPricesData
        : [];
      const rtMap = new Map<string, RoomType>(rtList.map((r) => [r.id, r]));
      const rtFromApi = roomData.room_types ?? {};
      const rtFull = rtMap.get(roomData.room_type_id) ?? rtFromApi;
      setRoom({
        ...roomData,
        room_types: { ...rtFromApi, roomImages: rtFull.roomImages ?? [] },
        room_price:
          rpList.find((rp: any) => rp.room_type_id === roomData.room_type_id) ??
          null,
      });
    } catch (err) {
      console.error("Lỗi khi lấy thông tin phòng:", err);
    } finally {
      setLoading(false);
    }
  }, [id, typeId, isByType]);

  const fetchCustomerProfile = useCallback(async () => {
    if (!authUser?.customers?.id) return;
    try {
      const profile = await customersApi.getCustomerById(authUser.customers.id);
      setCustomerProfile(profile);
      if (profile) {
        setGuestForm({
          full_name: profile.full_name || "",
          phone: profile.phone || "",
          email: profile.email || "",
          id_card_number: profile.id_card_number || "",
          nationality: profile.nationality || "Việt Nam",
          date_of_birth: profile.date_of_birth
            ? new Date(profile.date_of_birth).toISOString().split("T")[0]
            : "",
          address: profile.address || "",
        });
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin khách hàng:", error);
    }
  }, [authUser?.customers?.id]);
  const handleStartEditing = () => {
    const activeProfile = customerProfile || authUser?.customers;
    const formattedDob = activeProfile?.date_of_birth
      ? new Date(activeProfile.date_of_birth).toISOString().split("T")[0]
      : guestForm.date_of_birth || "";

    setEditCustomerForm({
      full_name: activeProfile?.full_name || guestForm.full_name || "",
      phone: activeProfile?.phone || guestForm.phone || "",
      email: activeProfile?.email || guestForm.email || "",
      id_card_number: activeProfile?.id_card_number || guestForm.id_card_number || "",
      date_of_birth: formattedDob,
      nationality: activeProfile?.nationality || guestForm.nationality || "Việt Nam",
      address: activeProfile?.address || guestForm.address || "",
    });
    setIsEditingCustomer(true);
  };

  const handleSaveCustomer = async () => {
    const customerId = customerProfile?.id || authUser?.customers?.id;
    if (!customerId || !editCustomerForm) return;

    if (
      !editCustomerForm.full_name.trim() ||
      !editCustomerForm.phone.trim() ||
      !editCustomerForm.email.trim() ||
      !editCustomerForm.id_card_number.trim()
    ) {
      message.error("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    setSavingCustomer(true);
    try {
      const payload: any = {
        full_name: editCustomerForm.full_name,
        phone: editCustomerForm.phone,
        email: editCustomerForm.email,
        id_card_number: editCustomerForm.id_card_number,
        date_of_birth: editCustomerForm.date_of_birth,
        nationality: editCustomerForm.nationality,
        address: editCustomerForm.address || undefined,
        account_id: authUser?.id,
      };
      const updated = await customersApi.updateCustomer(customerId, payload);
      const updatedData = updated?.data ?? updated ?? payload;
      setCustomerProfile(updatedData);
      setGuestForm({
        full_name: editCustomerForm.full_name,
        phone: editCustomerForm.phone,
        email: editCustomerForm.email,
        id_card_number: editCustomerForm.id_card_number,
        date_of_birth: editCustomerForm.date_of_birth,
        nationality: editCustomerForm.nationality,
        address: editCustomerForm.address || "",
      });
      message.success("Cập nhật thông tin khách hàng thành công!");
      setIsEditingCustomer(false);
    } catch (err: any) {
      console.error("Lỗi cập nhật thông tin khách hàng:", err);
      message.error(err?.response?.data?.message ?? "Cập nhật thông tin thất bại!");
    } finally {
      setSavingCustomer(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);
  useEffect(() => {
    fetchCustomerProfile();
  }, [fetchCustomerProfile]);


  const fetchServices = useCallback(async () => {
    if (!room?.branch_id) return;
    try {
      const svcs = await servicesApi.getServicesByBranchId(room.branch_id);
      console.log("svcs", svcs);
      setAvailableServices(svcs.filter((s: Service) => s.is_active));
    } catch (err) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", err);
    }
  }, [room?.branch_id]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Hàm kiểm tra phòng trống và chọn phòng tự động (chỉ dùng khi isByType)
  const handleCheckAvailabilityAndNext = async () => {
    if (!room || !isByType) {
      setStep(1);
      return;
    }
    setAvailabilityChecking(true);
    setAvailabilityError("");
    try {
      const finalCheckin =
        booking_type === "daily" ? checkin_at : hourlyCheckin;
      const finalCheckout =
        booking_type === "daily" ? checkout_at : hourlyCheckout;

      const result = await roomsAvailableApi.getRoomsAvailable({
        branch_id: room.branch_id,
        checkin: finalCheckin,
        checkout: finalCheckout,
        room_type_id: typeId,
      });

      console.log("result", result);

      if (result === 0) {
        setAvailabilityError(
          "Không còn phòng trống trong khoảng thời gian này. Vui lòng chọn ngày khác.",
        );
        return;
      }
      setStep(1);
    } catch (err) {
      console.error("Lỗi kiểm tra phòng trống:", err);
      setAvailabilityError("Không thể kiểm tra phòng trống. Vui lòng thử lại.");
    } finally {
      setAvailabilityChecking(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    setDiscountError("");
    setDiscount(null);
    try {
      const list: Promotion[] = await promotionApi.getPromotions();
      console.log("list", list);
      const found = list.find(
        (p: Promotion) =>
          p.code?.toLowerCase() === discountCode.trim().toLowerCase() &&
          new Date(p.valid_to) >= new Date() &&
          new Date(p.valid_from) <= new Date() &&
          p.is_active &&
          p.branch_id === room?.branch_id,
      );
      if (found) {
        const minOrderValue = Number(found.min_order_value ?? 0);
        const currentOrderValue =
          subtotal +
          bookingServices.reduce(
            (sum, item) => sum + item.service.price * item.quantity,
            0,
          );
        // Kiểm tra giá trị đơn hàng tối thiểu
        if (
          minOrderValue > 0 &&
          currentOrderValue > 0 &&
          currentOrderValue < minOrderValue
        ) {
          setDiscountError(
            `Đơn hàng tối thiểu để dùng mã này là ${formatVND(minOrderValue)}. Giá trị hiện tại: ${formatVND(currentOrderValue)}.`,
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
        setDiscountError("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
      }
    } catch {
      setDiscountError("Không thể kiểm tra mã giảm giá. Vui lòng thử lại.");
    } finally {
      setDiscountLoading(false);
    }
  };

  const nights =
    booking_type === "daily" ? diffDays(checkin_at, checkout_at) : 0;
  const pricePerNight = room?.room_price?.price_per_day
    ? Number(room.room_price.price_per_day)
    : 0;
  const pricePerHour = room?.room_price?.price_per_hour
    ? Number(room.room_price.price_per_hour)
    : 0;

  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      if (!room?.room_type_id || !room?.branch_id) return;

      const finalCheckin =
        booking_type === "daily" ? checkin_at : hourlyCheckin;
      const finalCheckout =
        booking_type === "daily" ? checkout_at : hourlyCheckout;

      if (!finalCheckin || !finalCheckout) {
        if (isMounted) setSubtotal(0);
        return;
      }

      setCalculatingPrice(true);
      try {
        const price = await bookingApi.calculateBookingPrice({
          room_type_id: room.room_type_id,
          branch_id: room.branch_id,
          booking_type: booking_type,
          checkin_at: finalCheckin,
          checkout_at: finalCheckout,
        });

        if (isMounted) {
          setSubtotal(Number(price) || 0);
        }
      } catch (err) {
        console.error("Lỗi tính giá phòng:", err);
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
    booking_type,
    checkin_at,
    checkout_at,
    hourlyCheckin,
    hourlyCheckout,
    room?.room_type_id,
    room?.branch_id,
  ]);
  console.log("subtotal", subtotal);

  const serviceSubtotal = bookingServices.reduce(
    (sum, item) => sum + item.service.price * item.quantity,
    0,
  );
  // Kiểm tra điều kiện đơn hàng tối thiểu
  const discountEligible =
    !discount ||
    discount.min_order_value <= 0 ||
    subtotal + serviceSubtotal >= discount.min_order_value;
  const discountAmount =
    discount && discountEligible
      ? discount.discount_type === "percentage"
        ? Math.round(
            ((subtotal + serviceSubtotal) * discount.discount_value) / 100,
          )
        : Math.min(discount.discount_value, subtotal + serviceSubtotal)
      : 0;
  const total = subtotal + serviceSubtotal - discountAmount;

  const step0Valid =
    booking_type === "daily"
      ? nights > 0 && num_guests >= 1
      : bookingDate !== "" &&
        startTime !== "" &&
        durationHours >= 1 &&
        num_guests >= 1;

  // Nếu đã có customer → hợp lệ luôn; nếu chưa → cần nhập đủ thông tin
  const step1Valid = existingCustomer
    ? true
    : guestForm.full_name.trim() !== "" &&
      guestForm.phone.trim() !== "" &&
      guestForm.email.trim() !== "" &&
      guestForm.id_card_number.trim() !== "" &&
      guestForm.date_of_birth !== "";

  const handleSubmit = async () => {
    if (!room) return;
    setSubmitting(true);
    setErrorMsg("");
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
          account_id: authUser?.id, // gắn account_id để lần sau tự load
        });
        customerId = newCustomer?.id ?? newCustomer?.data?.id;
      }

      if (!customerId) {
        throw new Error("Không thể lấy thông tin khách hàng.");
      }

      const finalCheckin =
        booking_type === "daily" ? checkin_at : hourlyCheckin;
      const finalCheckout =
        booking_type === "daily" ? checkout_at : hourlyCheckout;

      const bookingResponse = await bookingApi.createBooking({
        room_id: room.id,
        room_type_id: room.room_type_id,
        branch_id: room.branch_id,
        customer_id: customerId,
        booking_type,
        status: "pending",
        checkin_at: finalCheckin,
        checkout_at: finalCheckout,
        num_guests,
        discount_id: discount?.id ?? null,
        notes: notes || undefined,
      } as any);
      console.log("bookingResponse", bookingResponse.id);

      if (bookingServices.length > 0) {
        await Promise.all(
          bookingServices.map((bs) =>
            bookingServiceApi.create({
              booking_id: bookingResponse.id,
              service_id: bs.service.id,
              quantity: bs.quantity,
              unit_price: bs.service.price,
              total_amount: bs.service.price * bs.quantity,
            }),
          ),
        );
      }

      const depositAmount = Math.round(total * 0.3);
      if (paymentMode === "full" && total > 0) {
        try {
          const paymentResponse = await paymentApi.createZaloPayPayment(
            bookingResponse.id,
            total,
            // 10000,
            false,
          );
          window.location.href = paymentResponse.order_url;
        } catch (paymentError) {
          console.error("Lỗi khi tạo thanh toán ZaloPay:", paymentError);
          setErrorMsg("Không thể tạo thanh toán ZaloPay. Vui lòng thử lại.");
          setSubmitting(false);
          return;
        }
      } else if (paymentMode === "deposit" && depositAmount > 0) {
        try {
          const paymentResponse = await paymentApi.createZaloPayPayment(
            bookingResponse.id,
            depositAmount,
            // 5000,
            true,
          );
          window.location.href = paymentResponse.order_url;
        } catch (paymentError) {
          console.error("Lỗi khi tạo thanh toán ZaloPay:", paymentError);
          setErrorMsg("Không thể tạo thanh toán ZaloPay. Vui lòng thử lại.");
          setSubmitting(false);
          return;
        }
      }
    } catch (err: any) {
      console.error("Lỗi đặt phòng:", err);
      setErrorMsg(
        err?.response?.data?.message ?? "Đặt phòng thất bại. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  console.log("room", room);

  if (!isLoggedIn)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center flex flex-col items-center gap-5">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
            <FaRegUser className="text-amber-500 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Yêu cầu đăng nhập
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Bạn cần{" "}
            <span className="font-semibold text-amber-600">đăng nhập</span> để
            tiếp tục đặt phòng.
            <br />
            Sau khi đăng nhập, bạn sẽ được chuyển trở lại trang này.
          </p>
          <button
            onClick={() => navigate(`/login?returnUrl=/booking/${id}`)}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors"
          >
            Đăng nhập ngay
          </button>
          <button
            onClick={() => navigate("/rooms")}
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Quay lại danh sách phòng
          </button>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">Đang tải thông tin phòng...</p>
        </div>
      </div>
    );

  if (!room)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-700 mb-2">
            Không tìm thấy phòng
          </p>
          <button
            onClick={() => navigate("/rooms")}
            className="mt-4 text-amber-600 underline cursor-pointer"
          >
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

                <div className="flex flex-col gap-3 pt-2">
                  {/* Thông báo lỗi phòng trống */}
                  {availabilityError && (
                    <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                      <span className="mt-0.5 text-red-500">⚠</span>
                      <span>{availabilityError}</span>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      disabled={!step0Valid || availabilityChecking}
                      onClick={handleCheckAvailabilityAndNext}
                      className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                    >
                      {availabilityChecking ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{" "}
                          Đang kiểm tra...
                        </>
                      ) : (
                        "Tiếp theo →"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-6">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MdOutlinePersonOutline className="text-amber-500 text-xl" />{" "}
                  Thông tin khách hàng
                </h2>

                {!isEditingCustomer ? (
                  /* Hiển thị thông tin tổng quan dạng thẻ gọn */
                  <div className="flex flex-col gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                        <IoCheckmarkCircle className="text-lg" />
                        Đặt phòng với tài khoản đã đăng nhập
                      </div>
                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-300 transition-colors cursor-pointer shadow-sm"
                      >
                        <MdOutlineEdit className="text-sm text-amber-600" />
                        Thay đổi thông tin
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Họ tên</p>
                        <p className="font-semibold text-gray-800">
                          {customerProfile?.full_name || guestForm.full_name || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Điện thoại</p>
                        <p className="font-semibold text-gray-800">
                          {customerProfile?.phone || guestForm.phone || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Email</p>
                        <p className="font-semibold text-gray-800">
                          {customerProfile?.email || guestForm.email || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">CCCD/CMND</p>
                        <p className="font-semibold text-gray-800">
                          {customerProfile?.id_card_number || guestForm.id_card_number || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Quốc tịch</p>
                        <p className="font-semibold text-gray-800">
                          {customerProfile?.nationality || guestForm.nationality || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Ngày sinh</p>
                        <p className="font-semibold text-gray-800">
                          {(customerProfile?.date_of_birth || guestForm.date_of_birth)
                            ? new Date(customerProfile?.date_of_birth || guestForm.date_of_birth).toLocaleDateString("vi-VN")
                            : "—"}
                        </p>
                      </div>
                      {(customerProfile?.address || guestForm.address) && (
                        <div className="col-span-2 sm:col-span-3">
                          <p className="text-gray-500 text-xs">Địa chỉ</p>
                          <p className="font-semibold text-gray-800">
                            {customerProfile?.address || guestForm.address}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Form cập nhật thông tin thiết kế gọn gàng */
                  <div className="flex flex-col gap-4 p-4 bg-white border border-amber-300 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-bold text-sm text-gray-800 flex items-center gap-2">
                        <MdOutlineEdit className="text-amber-500" /> Cập nhật thông tin khách hàng
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingCustomer(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Họ và tên *</label>
                        <div className="relative">
                          <MdOutlinePersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                          <input
                            type="text"
                            value={editCustomerForm?.full_name || ""}
                            onChange={(e) => setEditCustomerForm(f => f ? ({ ...f, full_name: e.target.value }) : null)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Số điện thoại *</label>
                        <div className="relative">
                          <MdOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                          <input
                            type="tel"
                            value={editCustomerForm?.phone || ""}
                            onChange={(e) => setEditCustomerForm(f => f ? ({ ...f, phone: e.target.value }) : null)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Email *</label>
                        <div className="relative">
                          <MdOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                          <input
                            type="email"
                            value={editCustomerForm?.email || ""}
                            onChange={(e) => setEditCustomerForm(f => f ? ({ ...f, email: e.target.value }) : null)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Số CCCD / Hộ chiếu *</label>
                        <div className="relative">
                          <MdOutlineCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                          <input
                            type="text"
                            value={editCustomerForm?.id_card_number || ""}
                            onChange={(e) => setEditCustomerForm(f => f ? ({ ...f, id_card_number: e.target.value }) : null)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Ngày sinh *</label>
                        <div className="relative">
                          <MdOutlineCake className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                          <input
                            type="date"
                            value={editCustomerForm?.date_of_birth || ""}
                            onChange={(e) => setEditCustomerForm(f => f ? ({ ...f, date_of_birth: e.target.value }) : null)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Quốc tịch</label>
                        <div className="relative">
                          <MdOutlinePublic className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                          <input
                            type="text"
                            value={editCustomerForm?.nationality || ""}
                            onChange={(e) => setEditCustomerForm(f => f ? ({ ...f, nationality: e.target.value }) : null)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2 flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-700">Địa chỉ</label>
                        <div className="relative">
                          <MdOutlineHome className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
                          <input
                            type="text"
                            value={editCustomerForm?.address || ""}
                            onChange={(e) => setEditCustomerForm(f => f ? ({ ...f, address: e.target.value }) : null)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setIsEditingCustomer(false)}
                        className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        disabled={savingCustomer}
                        onClick={handleSaveCustomer}
                        className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        {savingCustomer ? "Đang lưu..." : "Lưu thay đổi"}
                      </button>
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

                {/* Dịch vụ đi kèm */}
                <div className="flex flex-col gap-2 mt-2 overflow-hidden">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <MdOutlineNotes className="text-gray-400" /> Dịch vụ đi kèm
                  </label>
                  {availableServices.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto max-h-36 pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                      {availableServices.map((svc) => {
                        const selected = bookingServices.find(
                          (s) => s.service.id === svc.id,
                        );
                        const quantity = selected ? selected.quantity : 0;
                        return (
                          <div
                            key={svc.id}
                            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl"
                          >
                            <div>
                              <p className="font-semibold text-sm text-gray-800">
                                {svc.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatVND(svc.price)} / {svc.unit}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {quantity > 0 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setBookingServices((prev) => {
                                        const existing = prev.find(
                                          (p) => p.service.id === svc.id,
                                        );
                                        if (existing && existing.quantity > 1) {
                                          return prev.map((p) =>
                                            p.service.id === svc.id
                                              ? {
                                                  ...p,
                                                  quantity: p.quantity - 1,
                                                }
                                              : p,
                                          );
                                        }
                                        return prev.filter(
                                          (p) => p.service.id !== svc.id,
                                        );
                                      });
                                    }}
                                    className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
                                  >
                                    −
                                  </button>
                                  <span className="text-sm font-semibold w-4 text-center">
                                    {quantity}
                                  </span>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setBookingServices((prev) => {
                                    const existing = prev.find(
                                      (p) => p.service.id === svc.id,
                                    );
                                    if (existing) {
                                      return prev.map((p) =>
                                        p.service.id === svc.id
                                          ? { ...p, quantity: p.quantity + 1 }
                                          : p,
                                      );
                                    }
                                    return [
                                      ...prev,
                                      { service: svc, quantity: 1 },
                                    ];
                                  });
                                }}
                                className={`w-7 h-7 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${quantity > 0 ? "border-gray-300 text-gray-600 hover:bg-gray-100" : "border-amber-500 text-amber-500 hover:bg-amber-50"}`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic px-2">
                      Không có dịch vụ nào.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-2">
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
                        <p className="font-semibold">{guestForm.nationality}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dịch vụ đã chọn */}
                {bookingServices.length > 0 && (
                  <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Dịch vụ đã chọn
                    </p>
                    <div className="flex flex-col gap-2">
                      {bookingServices.map((bs, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-700">
                            {bs.service.name}{" "}
                            <span className="text-gray-400">
                              x{bs.quantity}
                            </span>
                          </span>
                          <span className="font-semibold text-gray-800">
                            {formatVND(bs.service.price * bs.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                      KHÔNG hoàn tiền nếu hủy đặt phòng theo giờ. Vui lòng liên
                      hệ với chúng tôi để được hỗ trợ nếu có thay đổi về thời
                      gian đặt phòng.
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
                  <div className="flex flex-col gap-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>Tiền phòng ({nights || "?"} đêm)</span>
                      <span>
                        {nights > 0
                          ? calculatingPrice
                            ? "Đang tính..."
                            : formatVND(subtotal)
                          : "—"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>Tiền phòng ({durationHours} giờ)</span>
                      <span>
                        {calculatingPrice
                          ? "Đang tính..."
                          : formatVND(subtotal)}
                      </span>
                    </div>
                  </div>
                )}

                {bookingServices.length > 0 && (
                  <div className="flex flex-col gap-1 text-gray-600 mt-1">
                    <div className="flex justify-between font-medium">
                      <span>Tiền dịch vụ</span>
                      <span>{formatVND(serviceSubtotal)}</span>
                    </div>
                    {bookingServices.map((bs, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-xs text-gray-400 pl-2"
                      >
                        <span>
                          - {bs.service.name} (x{bs.quantity})
                        </span>
                        <span>{formatVND(bs.service.price * bs.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {discount && !discountEligible && (
                  <div className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-2">
                    <FaTag className="shrink-0" />
                    <span>
                      Mã <strong>{discount.label}</strong> yêu cầu đơn tối thiểu{" "}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
