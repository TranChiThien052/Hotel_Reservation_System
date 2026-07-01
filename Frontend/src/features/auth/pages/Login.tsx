import loginBG from "@/assets/images/login.png";
import { Input, Button, Alert } from "antd";
import { EyeInvisibleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { useNavigate } from "react-router-dom";
import type { LoginPayload } from "../types/auth-type";
import { getMeThunk, loginThunk } from "../store/auth-thunk";

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error } = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const payload: LoginPayload = { username, password,};
    
    await dispatch(loginThunk(payload)).unwrap();

    const user = await dispatch(getMeThunk()).unwrap();

    if (user.role === "admin") navigate("/admin" , {replace: true});
    else if (user.role === "staff") navigate("/staff", {replace: true});
    else if (user.role === "manager") navigate("/manager", {replace: true});
    else navigate("/", {replace: true});
    } catch {
      console.error("Login failed:", error);
    }
  };
  // return (
  //   <div
  //     className="relative bg-cover bg-center h-screen w-screen flex items-center justify-center font-sans"
  //     style={{ backgroundImage: `url(${loginBG})` }}
  //   >
  //     <div className="absolute inset-0 bg-black/50 z-0"></div>

  //     <div className="relative z-10 bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md h-auto flex flex-col justify-center items-center">
        
  //       <h2 className="text-3xl font-bold mb-10 text-gray-950 tracking-wider">
  //         ĐĂNG NHẬP
  //       </h2>

  //       <div className="w-full space-y-7">
          
  //         <div className="border-b border-gray-300 focus-within:border-gray-900 transition-colors duration-300 pb-1">
  //           <label className="block text-gray-900 text-sm mb-1 pl-1 font-semibold">Username</label>
  //           <Input
  //             placeholder="Your username"
  //             variant="borderless"
  //             suffix={<UserOutlined className="text-gray-400 text-lg" />} 
  //             className="w-full text-gray-950 text-base custom-antd-input-dark"
  //           />
  //         </div>

  //         <div className="border-b border-gray-300 focus-within:border-gray-900 transition-colors duration-300 pb-1 relative mb-6">
  //           <label className="block text-gray-900 text-sm mb-1 pl-1 font-semibold">Password</label>
  //           <Input.Password
  //             placeholder="********"
  //             variant="borderless"
  //             iconRender={(visible) => 
  //               visible ? (
  //                 <EyeOutlined className="text-gray-400 text-lg" />
  //               ) : (
  //                 <EyeInvisibleOutlined className="text-gray-400 text-lg" />
  //               )
  //             }
  //             className="w-full text-gray-950 text-base custom-antd-input-dark"
  //           />
            
  //           <div className="absolute right-0 -bottom-6">
  //             <a href="#" className="text-xs text-gray-500 hover:text-gray-950 transition-colors">
  //               Quên mật khẩu?
  //             </a>
  //           </div>
  //         </div>

  //         <Button 
  //           type="primary" 
  //           htmlType="submit" 
  //           style={{ backgroundColor: '#030712' }} 
  //           className="w-full h-12 hover:bg-gray-800! rounded-xl text-white font-bold text-base border-none shadow-md mt-6 transition-colors"
  //         >
  //           Đăng nhập
  //         </Button>

  //         <div className="text-center pt-4 flex justify-between items-center text-sm">
  //           <span className="text-gray-500">Chưa có tài khoản?</span>
  //           <div className="font-bold text-gray-950 hover:text-gray-800 transition-colors cursor-pointer">
  //             Đăng ký
  //           </div>
  //         </div>

  //       </div>
        
  //     </div>
  //   </div>
  // );
  return (
    <div
      className="relative flex h-screen w-screen items-center justify-center bg-cover bg-center font-sans"
      style={{ backgroundImage: `url(${loginBG})` }}
    >
      <div className="absolute inset-0 z-0 bg-black/50" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 flex w-full max-w-md flex-col items-center justify-center rounded-3xl bg-white p-12 shadow-2xl"
      >
        <h2 className="mb-10 text-3xl font-bold tracking-wider text-gray-950">
          ĐĂNG NHẬP
        </h2>

        <div className="w-full space-y-7">
          {error ? (
            <Alert type="error" showIcon message={error} />
          ) : null}

          <div className="border-b border-gray-300 pb-1 transition-colors duration-300 focus-within:border-gray-900">
            <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
              Username
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              variant="borderless"
              suffix={<UserOutlined className="text-lg text-gray-400" />}
              className="custom-antd-input-dark w-full text-base text-gray-950"
            />
          </div>

          <div className="relative mb-6 border-b border-gray-300 pb-1 transition-colors duration-300 focus-within:border-gray-900">
            <label className="mb-1 block pl-1 text-sm font-semibold text-gray-900">
              Password
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
              <a
                href="#"
                className="text-xs text-gray-500 transition-colors hover:text-gray-950"
              >
                Quên mật khẩu?
              </a>
            </div>
          </div>

          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ backgroundColor: "#030712" }}
            className="mt-6 h-12 w-full rounded-xl border-none font-bold text-white shadow-md transition-colors hover:bg-gray-800!"
          >
            Đăng nhập
          </Button>

          <div className="flex items-center justify-between pt-4 text-center text-sm">
            <span className="text-gray-500">Chưa có tài khoản?</span>
            <div className="cursor-pointer font-bold text-gray-950 transition-colors hover:text-gray-800">
              Đăng ký
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;