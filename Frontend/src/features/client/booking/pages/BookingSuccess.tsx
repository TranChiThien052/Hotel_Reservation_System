import { useNavigate, useSearchParams } from "react-router-dom";
import { IoCheckmarkCircle } from "react-icons/io5";
import { useCallback, useEffect, useState } from "react";
import { paymentApi } from "../api/payment-api";
import { useAppSelector } from "@/app/store/hooks";

const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const BookingSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || sessionStorage.getItem("zp_role");

  useEffect(() => {
    if (role === "staff") {
      navigate(`/staff/payment/success?${searchParams.toString()}`, {
        replace: true,
      });
    } else if (role === "manager") {
      navigate(`/manager/payment/success?${searchParams.toString()}`, {
        replace: true,
      });
    }
  }, [user, navigate, searchParams]);

  const callback = useCallback(async () => {
    try {
      const response = await paymentApi.getZaloPayPaymentResult({
        appid: Number(searchParams.get("appid")),
        apptransid: searchParams.get("apptransid") || "",
        pmcid: searchParams.get("pmcid") || "",
        bankcode: searchParams.get("bankcode") || "",
        amount: Number(searchParams.get("amount")),
        discountamount: Number(searchParams.get("discountamount")),
        status: searchParams.get("status") || "",
        checksum: searchParams.get("checksum") || "",
      });
      console.log("response", response);
      setPaymentResult(response);
    } catch (error) {
      console.error("Error fetching payment result:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    callback();
  }, [callback]);

  console.log("paymentResult", paymentResult);

  if (role === "staff" || role === "manager") {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-green-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt phòng thành công!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Cảm ơn bạn đã đặt phòng tại{" "}
            <span className="font-semibold text-amber-600">Aurora Hotel</span>
            .<br />
            Chúng tôi sẽ xác nhận trong thời gian sớm nhất.
          </p>
        </div>

        <div className="w-full bg-gray-50 rounded-2xl p-5 flex flex-col gap-3 text-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              Đã thanh toán
            </span>
            <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs uppercase tracking-wide">
              {formatVND(paymentResult?.payments?.amount)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              Vào lúc
            </span>
            <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs uppercase tracking-wide">
              {paymentResult?.payments?.created_at &&
                new Date(paymentResult.payments.created_at).toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center gap-1.5">
              Mã giao dịch:
            </span>
            <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs uppercase tracking-wide">
              {paymentResult?.payments?.transaction_ref}
            </span>
          </div>
        </div>

        <div className="w-full bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-700 leading-relaxed">
          <p className="font-semibold mb-1">📧 Thông tin xác nhận</p>
          <p>
            Truy cập "Chi tiết đơn đặt phòng" để xem thông tin chi tiết về đặt
            phòng của bạn, bao gồm mã đặt phòng, và các chi tiết liên quan khác.
          </p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={() =>
              navigate(`/my-bookings/${paymentResult?.payments?.booking_id}`)
            }
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-colors cursor-pointer"
          >
            Chi tiết đơn đặt phòng
          </button>
          <button
            onClick={() => navigate("/rooms")}
            className="text-sm text-gray-400 hover:text-gray-600 underline cursor-pointer"
          >
            Khám phá thêm phòng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
