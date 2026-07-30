import { useNavigate, useSearchParams } from "react-router-dom";
import { IoCloseCircle, IoWarning, IoRefreshOutline, IoHomeOutline, IoHelpCircleOutline } from "react-icons/io5";
import { useCallback, useEffect, useState } from "react";
import { paymentApi } from "../api/payment-api";
import { useAppSelector } from "@/app/store/hooks";

const formatVND = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

const BookingFailed = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const user = useAppSelector((s) => s.auth.user);
  const role = user?.role || sessionStorage.getItem("zp_role");

  // Query parameters from ZaloPay redirect
  const statusParam = searchParams.get("status");
  const reasonParam = searchParams.get("reason");
  const apptransid = searchParams.get("apptransid") || paymentResult?.payments?.transaction_ref || "";
  const rawAmount = searchParams.get("amount") || paymentResult?.payments?.amount;
  const amount = rawAmount ? Number(rawAmount) : null;

  // Is this a user cancellation?
  const isCancelled = statusParam === "-49" || reasonParam === "cancel" || reasonParam === "user_cancel";

  useEffect(() => {
    if (role === "staff") {
      navigate(`/staff/payment/failed?${searchParams.toString()}`, { replace: true });
    } else if (role === "manager") {
      navigate(`/manager/payment/failed?${searchParams.toString()}`, { replace: true });
    }
  }, [user, navigate, searchParams, role]);

  const verifyResult = useCallback(async () => {
    if (!searchParams.get("apptransid")) {
      setLoading(false);
      return;
    }

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
      setPaymentResult(response);
    } catch (error) {
      console.error("Lỗi xác minh kết quả thanh toán:", error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    verifyResult();
  }, [verifyResult]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Đang kiểm tra kết quả giao dịch ZaloPay...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-amber-50 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 max-w-lg w-full flex flex-col items-center gap-6 border border-gray-100 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 ${isCancelled ? 'bg-amber-400' : 'bg-rose-500'}`} />
        <div className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 ${isCancelled ? 'bg-orange-300' : 'bg-red-400'}`} />

        {/* Status Icon Header */}
        <div className="relative">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-inner ${isCancelled ? 'bg-amber-100 text-amber-500' : 'bg-rose-100 text-rose-500'}`}>
            {isCancelled ? (
              <IoWarning className="text-6xl" />
            ) : (
              <IoCloseCircle className="text-6xl" />
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow text-white text-xs font-bold ${isCancelled ? 'bg-amber-500' : 'bg-rose-600'}`}>
            !
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
            {isCancelled ? "Giao dịch đã bị hủy" : "Thanh toán không thành công"}
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-md">
            {isCancelled ? (
              <>
                Bạn đã hủy quá trình thanh toán qua ZaloPay cho đơn đặt phòng tại{" "}
                <span className="font-semibold text-amber-600">Aurora Hotel</span>. Đơn hàng chưa được hoàn tất.
              </>
            ) : (
              <>
                Rất tiếc, giao dịch qua ví ZaloPay đã bị gián đoạn hoặc không thành công. Bạn có thể thử lại hoặc chọn phương thức khác.
              </>
            )}
          </p>
        </div>

        {/* Detailed Information Box */}
        <div className="w-full bg-gray-50 rounded-2xl p-5 flex flex-col gap-3 text-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Trạng thái:</span>
            <span className={`font-semibold px-3 py-1 rounded-full text-xs uppercase tracking-wide border ${
              isCancelled 
                ? 'text-amber-700 bg-amber-50 border-amber-200' 
                : 'text-rose-700 bg-rose-50 border-rose-200'
            }`}>
              {isCancelled ? "Đã hủy giao dịch" : "Thanh toán thất bại"}
            </span>
          </div>

          {amount ? (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Số tiền:</span>
              <span className="font-bold text-gray-800">
                {formatVND(amount)}
              </span>
            </div>
          ) : null}

          {apptransid ? (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Mã giao dịch:</span>
              <span className="font-mono text-xs font-semibold text-gray-700 bg-gray-200/70 px-2 py-1 rounded">
                {apptransid}
              </span>
            </div>
          ) : null}

          {reasonParam && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Lý do:</span>
              <span className="text-xs text-gray-600 font-medium">
                {reasonParam === "invalid_checksum" 
                  ? "Mã xác thực không hợp lệ" 
                  : reasonParam === "user_cancel" 
                  ? "Người dùng chủ động hủy" 
                  : "Không đủ số dư / Hết hạn phiên"}
              </span>
            </div>
          )}
        </div>

        {/* Helper Note Box */}
        <div className="w-full bg-amber-50/80 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-800 leading-relaxed flex items-start gap-3">
          <IoHelpCircleOutline className="text-amber-600 text-lg shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-0.5">Bạn muốn tiếp tục đặt phòng?</p>
            <p className="text-amber-700">
              Đừng lo lắng, phòng bạn chọn vẫn khả dụng. Bạn có thể chọn lại loại phòng hoặc liên hệ bộ phận hỗ trợ khách hàng của Aurora Hotel.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3 pt-2">
          <button
            onClick={() => navigate("/rooms")}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <IoRefreshOutline className="text-lg" />
            Thử đặt phòng lại
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm cursor-pointer"
            >
              <IoHomeOutline className="text-base" />
              Trang chủ
            </button>
            <button
              onClick={() => navigate("/my-bookings")}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm cursor-pointer"
            >
              Đơn hàng của tôi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BookingFailed;
