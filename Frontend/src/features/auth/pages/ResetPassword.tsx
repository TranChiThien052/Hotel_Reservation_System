import loginBG from "@/assets/images/login.png";
import { Input, Button, Alert } from "antd";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../api/auth-api";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const fieldCls =
        "border-b border-gray-300 pb-1 transition-colors duration-300 focus-within:border-gray-900";

    const iconRender = (visible: boolean) =>
        visible ? (
            <EyeOutlined className="text-lg text-gray-400" />
        ) : (
            <EyeInvisibleOutlined className="text-lg text-gray-400" />
        );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!newPassword) {
            setError("Vui lòng nhập mật khẩu mới.");
            return;
        }
        if (newPassword.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp.");
            return;
        }
        if (!token) {
            setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword(token, newPassword);
            setSuccess(true);
        } catch (err: any) {
            const status = err?.response?.status;
            const msg = err?.response?.data?.error ?? err?.message ?? "";
            if (status === 400 || msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("expired")) {
                setError("Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại.");
            } else if (status === 404) {
                setError("Không tìm thấy yêu cầu đặt lại mật khẩu.");
            } else {
                setError("Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="relative flex min-h-screen w-screen items-center justify-center bg-cover bg-center font-sans py-8"
            style={{ backgroundImage: `url(${loginBG})` }}
        >
            <div className="absolute inset-0 z-0 bg-black/50" />

            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="px-12 py-10">

                    {/* Token không hợp lệ (không có token) */}
                    {!token ? (
                        <div className="flex flex-col items-center gap-5 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                                <HiOutlineExclamationCircle className="text-red-500 text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Link không hợp lệ</h2>
                            <p className="text-sm text-gray-500">
                                Link đặt lại mật khẩu này không hợp lệ hoặc đã hết hạn.
                                Vui lòng yêu cầu lại từ trang đăng nhập.
                            </p>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full h-12 rounded-xl bg-gray-950 text-white font-bold hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Quay lại đăng nhập
                            </button>
                        </div>
                    ) : success ? (
                        /* Thành công */
                        <div className="flex flex-col items-center gap-5 text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <IoCheckmarkCircleOutline className="text-green-500 text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Đặt lại thành công!</h2>
                            <p className="text-sm text-gray-500">
                                Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.
                            </p>
                            <button
                                onClick={() => navigate("/login")}
                                className="w-full h-12 rounded-xl bg-gray-950 text-white font-bold hover:bg-gray-800 transition-colors cursor-pointer"
                            >
                                Đăng nhập ngay
                            </button>
                        </div>
                    ) : (
                        /* Form đặt lại mật khẩu */
                        <>
                            <h2 className="mb-3 text-center text-3xl font-bold tracking-wider text-gray-950">
                                ĐẶT LẠI MẬT KHẨU
                            </h2>
                            <p className="mb-8 text-center text-sm text-gray-500">
                                Nhập mật khẩu mới cho tài khoản của bạn.
                            </p>

                            <form onSubmit={handleSubmit} className="w-full space-y-7">
                                {error && (
                                    <Alert type="error" showIcon message={error} />
                                )}

                                <div className={fieldCls}>
                                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                                        Mật khẩu mới <span className="text-red-500">*</span>
                                    </label>
                                    <Input.Password
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Tối thiểu 6 ký tự"
                                        variant="borderless"
                                        iconRender={iconRender}
                                        className="custom-antd-input-dark w-full text-base text-gray-950"
                                    />
                                </div>

                                <div className={fieldCls}>
                                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <Input.Password
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Nhập lại mật khẩu mới"
                                        variant="borderless"
                                        iconRender={iconRender}
                                        className="custom-antd-input-dark w-full text-base text-gray-950"
                                    />
                                </div>

                                {/* Strength hint */}
                                {newPassword && (
                                    <div className="flex gap-1.5">
                                        {[...Array(4)].map((_, i) => {
                                            const len = newPassword.length;
                                            const active =
                                                i === 0 ? len >= 1 :
                                                i === 1 ? len >= 6 :
                                                i === 2 ? len >= 10 :
                                                len >= 14 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
                                            const color =
                                                i === 0 ? "bg-red-400" :
                                                i === 1 ? "bg-orange-400" :
                                                i === 2 ? "bg-yellow-400" :
                                                "bg-green-500";
                                            return (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all ${active ? color : "bg-gray-200"}`}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    style={{ backgroundColor: "#030712" }}
                                    className="h-12 w-full rounded-xl border-none font-bold text-white shadow-md hover:bg-gray-800!"
                                >
                                    Xác nhận đặt lại mật khẩu
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/login")}
                                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                                    >
                                        ← Quay lại đăng nhập
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
