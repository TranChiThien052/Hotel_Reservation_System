import loginBG from "@/assets/images/login.png";
import { Input, Button, Alert } from "antd";
import { EyeInvisibleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { useNavigate } from "react-router-dom";
import type { LoginPayload } from "../types/auth-type";
import { getMeThunk, loginThunk } from "../store/auth-thunk";
import { accountApi } from "@/features/admin/adminAccounts/api/accounts-api";

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  full_name: string;
  phone: string;
}

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error } = useAppSelector((state) => state.auth);

  // mode hiện tại đang hiển thị
  const [mode, setMode] = useState<'login' | 'register'>('login');
  // content đang render (thay đổi sau khi fade-out xong)
  const [displayed, setDisplayed] = useState<'login' | 'register'>('login');
  // trạng thái animation: 'idle' | 'out' | 'in'
  const [anim, setAnim] = useState<'idle' | 'out' | 'in'>('idle');
  // hướng slide: 'left' = sang đăng ký, 'right' = quay về
  const [dir, setDir] = useState<'left' | 'right'>('left');

  // Login state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register state
  const [regForm, setRegForm] = useState<RegisterForm>({
    username: '', password: '', confirmPassword: '', full_name: '', phone: '',
  });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Switch với animation
  const switchMode = (next: 'login' | 'register') => {
    if (anim !== 'idle' || mode === next) return;
    setDir(next === 'register' ? 'left' : 'right');
    setAnim('out');
    setMode(next);
  };

  useEffect(() => {
    if (anim === 'out') {
      // sau 260ms fade+slide out → đổi content → fade in
      const t1 = setTimeout(() => {
        setDisplayed(mode);
        setRegError('');
        setRegSuccess(false);
        setAnim('in');
      }, 260);
      return () => clearTimeout(t1);
    }
    if (anim === 'in') {
      const t2 = setTimeout(() => setAnim('idle'), 300);
      return () => clearTimeout(t2);
    }
  }, [anim, mode]);

  // Classes cho animation của content
  const contentCls = (() => {
    if (anim === 'out') {
      return dir === 'left'
        ? 'opacity-0 -translate-x-6 pointer-events-none'
        : 'opacity-0 translate-x-6 pointer-events-none';
    }
    if (anim === 'in') {
      return dir === 'left'
        ? 'opacity-0 translate-x-6'
        : 'opacity-0 -translate-x-6';
    }
    return 'opacity-100 translate-x-0';
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
    setRegError('');
    if (!regForm.username.trim() || !regForm.password || !regForm.full_name.trim() || !regForm.phone.trim()) {
      setRegError('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (regForm.password.length < 6) {
      setRegError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      setRegError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setRegLoading(true);
    try {
      await accountApi.createAccount({
        username: regForm.username,
        password: regForm.password,
        full_name: regForm.full_name,
        phone: regForm.phone,
        status: 'active',
        role: 'customer',
      });
      setRegSuccess(true);
      setTimeout(() => switchMode('login'), 1800);
    } catch (err: any) {
      setRegError(err?.message ?? 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setRegLoading(false);
    }
  };
  console.log('regForm:', regForm);

  const fieldCls = "border-b border-gray-300 pb-1 transition-colors duration-300 focus-within:border-gray-900";

  return (
    <div
      className="relative flex min-h-screen w-screen items-center justify-center bg-cover bg-center font-sans py-8"
      style={{ backgroundImage: `url(${loginBG})` }}
    >
      <div className="absolute inset-0 z-0 bg-black/50" />

      {/* Card — tự động giãn theo nội dung, animate max-w */}
      <div
        className={`relative z-10 w-full overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-500 ${
          displayed === 'login' ? 'max-w-md' : 'max-w-lg'
        }`}
      >
        {/* Content wrapper — animate slide + fade */}
        <div
          className={`transition-all duration-300 ease-in-out ${contentCls}`}
        >

          {/* ── ĐĂNG NHẬP ─────────────────────────────────────────────── */}
          {displayed === 'login' && (
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
                      visible
                        ? <EyeOutlined className="text-lg text-gray-400" />
                        : <EyeInvisibleOutlined className="text-lg text-gray-400" />
                    }
                    className="custom-antd-input-dark w-full text-base text-gray-950"
                  />
                  <div className="absolute right-0 -bottom-6">
                    <a href="#" className="text-xs text-gray-500 hover:text-gray-950 transition-colors">
                      Quên mật khẩu?
                    </a>
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
                    onClick={() => switchMode('register')}
                    className="cursor-pointer font-bold text-gray-950 hover:text-amber-600 hover:underline underline-offset-2 transition-colors"
                  >
                    Đăng ký ngay →
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── ĐĂNG KÝ ───────────────────────────────────────────────── */}
          {displayed === 'register' && (
            <div className="px-12 py-10">
              <h2 className="mb-8 text-center text-3xl font-bold tracking-wider text-gray-950">
                ĐĂNG KÝ
              </h2>

              <form onSubmit={handleRegister} className="w-full">
                {/* Alerts */}
                {regSuccess && (
                  <div className="mb-5">
                    <Alert type="success" showIcon message="Đăng ký thành công! Đang chuyển về trang đăng nhập..." />
                  </div>
                )}
                {regError && !regSuccess && (
                  <div className="mb-5">
                    <Alert type="error" showIcon message={regError} />
                  </div>
                )}

                {/* 2-column grid cho form register */}
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-x-6 gap-y-5">

                  {/* Họ và tên — full width */}
                  <div className={`sm:col-span-1 ${fieldCls}`}>
                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={regForm.full_name}
                      onChange={(e) => setRegForm(f => ({ ...f, full_name: e.target.value }))}
                      placeholder="Nguyễn Văn A"
                      variant="borderless"
                      className="custom-antd-input-dark w-full text-base text-gray-950"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div className={fieldCls}>
                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={regForm.phone}
                      onChange={(e) => setRegForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="0901 234 567"
                      variant="borderless"
                      className="custom-antd-input-dark w-full text-base text-gray-950"
                    />
                  </div>

                  {/* Tên đăng nhập */}
                  <div className={fieldCls}>
                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                      Tên đăng nhập <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={regForm.username}
                      onChange={(e) => setRegForm(f => ({ ...f, username: e.target.value }))}
                      placeholder="Nhập tên đăng nhập"
                      variant="borderless"
                      suffix={<UserOutlined className="text-lg text-gray-400" />}
                      className="custom-antd-input-dark w-full text-base text-gray-950"
                    />
                  </div>

                  {/* Mật khẩu */}
                  <div className={fieldCls}>
                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                      Mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <Input.Password
                      value={regForm.password}
                      onChange={(e) => setRegForm(f => ({ ...f, password: e.target.value }))}
                      placeholder="Tối thiểu 6 ký tự"
                      variant="borderless"
                      iconRender={(visible) =>
                        visible
                          ? <EyeOutlined className="text-lg text-gray-400" />
                          : <EyeInvisibleOutlined className="text-lg text-gray-400" />
                      }
                      className="custom-antd-input-dark w-full text-base text-gray-950"
                    />
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div className={fieldCls}>
                    <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
                      Xác nhận mật khẩu <span className="text-red-500">*</span>
                    </label>
                    <Input.Password
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm(f => ({ ...f, confirmPassword: e.target.value }))}
                      placeholder="Nhập lại mật khẩu"
                      variant="borderless"
                      iconRender={(visible) =>
                        visible
                          ? <EyeOutlined className="text-lg text-gray-400" />
                          : <EyeInvisibleOutlined className="text-lg text-gray-400" />
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
                    onClick={() => switchMode('login')}
                    className="cursor-pointer font-bold text-gray-950 hover:text-amber-600 hover:underline underline-offset-2 transition-colors"
                  >
                    ← Đăng nhập
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;