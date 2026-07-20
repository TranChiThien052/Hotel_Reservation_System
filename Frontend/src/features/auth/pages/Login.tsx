import loginBG from "@/assets/images/login.png";
import { Input, Button, Alert } from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { useNavigate } from "react-router-dom";
import type { LoginPayload } from "../types/auth-type";
import { getMeThunk, loginThunk } from "../store/auth-thunk";
import { accountApi } from "@/features/admin/adminAccounts/api/accounts-api";
import { authApi } from "../api/auth-api";

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
}

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error } = useAppSelector((state) => state.auth);

  
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [displayed, setDisplayed] = useState<"login" | "register" | "forgot">("login");
  const [anim, setAnim] = useState<"idle" | "out" | "in">("idle");
  const [dir, setDir] = useState<"left" | "right">("left");

  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  
  const [regForm, setRegForm] = useState<RegisterForm>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const switchMode = (next: "login" | "register" | "forgot") => {
    if (anim !== "idle" || mode === next) return;
    
    if (next === "register") setDir("left");
    else if (next === "forgot") setDir("left");
    else setDir("right");
    setAnim("out");
    setMode(next);
  };

  useEffect(() => {
    if (anim === "out") {
      const t1 = setTimeout(() => {
        setDisplayed(mode);
        setRegError("");
        setRegSuccess(false);
        setForgotError("");
        setForgotSuccess(false);
        setForgotEmail("");
        setAnim("in");
      }, 260);
      return () => clearTimeout(t1);
    }
    if (anim === "in") {
      const t2 = setTimeout(() => setAnim("idle"), 300);
      return () => clearTimeout(t2);
    }
  }, [anim, mode]);

  const contentCls = (() => {
    if (anim === "out") {
      return dir === "left"
        ? "opacity-0 -translate-x-6 pointer-events-none"
        : "opacity-0 translate-x-6 pointer-events-none";
    }
    if (anim === "in") {
      return dir === "left"
        ? "opacity-0 translate-x-6"
        : "opacity-0 -translate-x-6";
    }
    return "opacity-100 translate-x-0";
  })();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const payload: LoginPayload = { username, password };
      await dispatch(loginThunk(payload)).unwrap();
      const user = await dispatch(getMeThunk()).unwrap();
      if (user.role === "admin") navigate("/admin", { replace: true });
      else if (user.role === "staff") navigate("/staff", { replace: true });
      else if (user.role === "manager") navigate("/manager", { replace: true });
      else navigate("/", { replace: true });
    } catch {
      console.error("Login failed:", error);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRegError("");
    if (!regForm.username.trim() || !regForm.password) {
      setRegError("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }
    if (regForm.password.length < 6) {
      setRegError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setRegError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setRegLoading(true);
    try {
      await accountApi.createAccount({
        username: regForm.username,
        password: regForm.password,
        status: "active",
        role: "customer",
      });
      setRegSuccess(true);
      setTimeout(() => switchMode("login"), 1800);
    } catch (err: any) {
      setRegError(err?.message ?? "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setRegLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail.trim()) {
      setForgotError("Vui lòng nhập địa chỉ email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotEmail)) {
      setForgotError("Địa chỉ email không hợp lệ.");
      return;
    }
    setForgotLoading(true);
    try {
      await authApi.requestPasswordReset(forgotEmail);
      setForgotSuccess(true);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? err?.message;
      if (msg?.toLowerCase().includes("not found") || err?.response?.status === 404) {
        setForgotError("Không tìm thấy tài khoản với email này.");
      } else {
        setForgotError("Gửi yêu cầu thất bại. Vui lòng thử lại.");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const fieldCls =
    "border-b border-gray-300 pb-1 transition-colors duration-300 focus-within:border-gray-900";

  // Chiều rộng card tùy mode
  const cardWidth =
    displayed === "login" ? "max-w-md" : "max-w-lg";

  return (
    <div
      className="relative flex min-h-screen w-screen items-center justify-center bg-cover bg-center font-sans py-8"
      style={{ backgroundImage: `url(${loginBG})` }}
    >
      <div className="absolute inset-0 z-0 bg-black/50" />

      
      <div
        className={`relative z-10 w-full overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-500 ${cardWidth}`}
      >
        
        <div
          className={`transition-all duration-300 ease-in-out ${contentCls}`}
        >
          
          {displayed === "login" && (
            <div className="px-12 py-10">
              <h2 className="mb-10 text-center text-3xl font-bold tracking-wider text-gray-950">
                ĐĂNG NHẬP
              </h2>

              <form onSubmit={handleLogin} className="w-full space-y-7">
                {error && (
                  <Alert
                    type="error"
                    showIcon
                    message="Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin."
                  />
                )}

                <div className={fieldCls}>
                  <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                    Tên đăng nhập
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập"
                    variant="borderless"
                    suffix={<UserOutlined className="text-lg text-gray-400" />}
                    className="custom-antd-input-dark w-full text-base text-gray-950"
                  />
                </div>

                <div className={`relative mb-6 ${fieldCls}`}>
                  <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                    Mật khẩu
                  </label>
                  <Input.Password
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    variant="borderless"
                    iconRender={(visible) =>
                      visible ? (
                        <EyeOutlined className="text-lg text-gray-400" />
                      ) : (
                        <EyeInvisibleOutlined className="text-lg text-gray-400" />
                      )
                    }
                    className="custom-antd-input-dark w-full text-base text-gray-950"
                  />
                  <div className="absolute right-0 -bottom-6">
                    <button
                      type="button"
                      onClick={() => switchMode("forgot")}
                      className="text-xs text-gray-500 hover:text-gray-950 transition-colors cursor-pointer"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ backgroundColor: "#030712" }}
                  className="mt-6 h-12 w-full rounded-xl border-none font-bold text-white shadow-md hover:bg-gray-800!"
                >
                  Đăng nhập
                </Button>

                <div
                  onClick={() => navigate("/", { replace: true })}
                  className="cursor-pointer text-center text-sm text-gray-500 hover:text-blue-700 transition-colors"
                >
                  Quay về trang chủ
                </div>

                <div className="flex items-center justify-between pt-2 text-sm">
                  <span className="text-gray-500">Chưa có tài khoản?</span>
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="cursor-pointer font-bold text-gray-950 hover:text-amber-600 hover:underline underline-offset-2 transition-colors"
                  >
                    Đăng ký ngay →
                  </button>
                </div>
              </form>
            </div>
          )}

          
          {displayed === "register" && (
            <div className="px-12 py-10">
              <h2 className="mb-8 text-center text-3xl font-bold tracking-wider text-gray-950">
                ĐĂNG KÝ
              </h2>

              <form onSubmit={handleRegister} className="w-full">
                {regSuccess && (
                  <div className="mb-5">
                    <Alert
                      type="success"
                      showIcon
                      message="Đăng ký thành công! Đang chuyển về trang đăng nhập..."
                    />
                  </div>
                )}
                {regError && !regSuccess && (
                  <div className="mb-5">
                    <Alert type="error" showIcon message={regError} />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-1 gap-x-6 gap-y-5">
                  <div className={fieldCls}>
                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={regForm.username}
                      onChange={(e) =>
                        setRegForm((f) => ({ ...f, username: e.target.value }))
                      }
                      placeholder="Nhập tên đăng nhập"
                      variant="borderless"
                      suffix={
                        <UserOutlined className="text-lg text-gray-400" />
                      }
                      className="custom-antd-input-dark w-full text-base text-gray-950"
                    />
                  </div>

                  <div className={fieldCls}>
                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <Input.Password
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm((f) => ({ ...f, password: e.target.value }))
                      }
                      placeholder="Tối thiểu 6 ký tự"
                      variant="borderless"
                      iconRender={(visible) =>
                        visible ? (
                          <EyeOutlined className="text-lg text-gray-400" />
                        ) : (
                          <EyeInvisibleOutlined className="text-lg text-gray-400" />
                        )
                      }
                      className="custom-antd-input-dark w-full text-base text-gray-950"
                    />
                  </div>

                  <div className={fieldCls}>
                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <Input.Password
                      value={regForm.confirmPassword}
                      onChange={(e) =>
                        setRegForm((f) => ({
                          ...f,
                          confirmPassword: e.target.value,
                        }))
                      }
                      placeholder="Nhập lại mật khẩu"
                      variant="borderless"
                      iconRender={(visible) =>
                        visible ? (
                          <EyeOutlined className="text-lg text-gray-400" />
                        ) : (
                          <EyeInvisibleOutlined className="text-lg text-gray-400" />
                        )
                      }
                      className="custom-antd-input-dark w-full text-base text-gray-950"
                    />
                  </div>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  loading={regLoading}
                  disabled={regSuccess}
                  style={{ backgroundColor: "#030712" }}
                  className="mt-6 h-12 w-full rounded-xl border-none font-bold text-white shadow-md hover:bg-gray-800!"
                >
                  Tạo tài khoản
                </Button>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-500">Đã có tài khoản?</span>
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="cursor-pointer font-bold text-gray-950 hover:text-amber-600 hover:underline underline-offset-2 transition-colors"
                  >
                    ← Đăng nhập
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── QUÊN MẬT KHẨU ──────────────────────────────────────── */}
          {displayed === "forgot" && (
            <div className="px-12 py-10">
              <h2 className="mb-3 text-center text-3xl font-bold tracking-wider text-gray-950">
                QUÊN MẬT KHẨU
              </h2>
              <p className="mb-8 text-center text-sm text-gray-500">
                Nhập email liên kết với tài khoản của bạn.<br />
                Chúng tôi sẽ gửi link đặt lại mật khẩu.
              </p>

              <form onSubmit={handleForgotPassword} className="w-full space-y-6">
                {forgotSuccess ? (
                  <div className="space-y-4">
                    <Alert
                      type="success"
                      showIcon
                      message="Email đã được gửi!"
                      description={
                        <span>
                          Vui lòng kiểm tra hộp thư của{" "}
                          <strong>{forgotEmail}</strong> và nhấn vào link để
                          đặt lại mật khẩu. Kiểm tra cả thư mục spam nếu không thấy.
                        </span>
                      }
                    />
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="w-full text-center text-sm text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                    >
                      ← Quay lại đăng nhập
                    </button>
                  </div>
                ) : (
                  <>
                    {forgotError && (
                      <Alert type="error" showIcon message={forgotError} />
                    )}

                    <div className={fieldCls}>
                      <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                        Địa chỉ Email
                      </label>
                      <Input
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="example@email.com"
                        type="email"
                        variant="borderless"
                        suffix={<MailOutlined className="text-lg text-gray-400" />}
                        className="custom-antd-input-dark w-full text-base text-gray-950"
                      />
                    </div>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={forgotLoading}
                      style={{ backgroundColor: "#030712" }}
                      className="h-12 w-full rounded-xl border-none font-bold text-white shadow-md hover:bg-gray-800!"
                    >
                      Gửi link đặt lại mật khẩu
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="cursor-pointer font-bold text-gray-950 hover:text-amber-600 hover:underline underline-offset-2 transition-colors"
                      >
                        ← Đăng nhập
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
