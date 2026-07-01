import loginBG from "@/assets/images/login.png";
import { Input, Button } from "antd";
import { EyeInvisibleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';

const Login = () => {
  return (
    <div
      className="relative bg-cover bg-center h-screen w-screen flex items-center justify-center font-sans"
      style={{ backgroundImage: `url(${loginBG})` }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div className="relative z-10 bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md h-auto flex flex-col justify-center items-center">
        
        <h2 className="text-3xl font-bold mb-10 text-gray-950 tracking-wider">
          ĐĂNG NHẬP
        </h2>

        <div className="w-full space-y-7">
          
          <div className="border-b border-gray-300 focus-within:border-gray-900 transition-colors duration-300 pb-1">
            <label className="block text-gray-900 text-sm mb-1 pl-1 font-semibold">Username</label>
            <Input
              placeholder="Your username"
              variant="borderless"
              suffix={<UserOutlined className="text-gray-400 text-lg" />} 
              className="w-full text-gray-950 text-base custom-antd-input-dark"
            />
          </div>

          <div className="border-b border-gray-300 focus-within:border-gray-900 transition-colors duration-300 pb-1 relative mb-6">
            <label className="block text-gray-900 text-sm mb-1 pl-1 font-semibold">Password</label>
            <Input.Password
              placeholder="********"
              variant="borderless"
              iconRender={(visible) => 
                visible ? (
                  <EyeOutlined className="text-gray-400 text-lg" />
                ) : (
                  <EyeInvisibleOutlined className="text-gray-400 text-lg" />
                )
              }
              className="w-full text-gray-950 text-base custom-antd-input-dark"
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
            style={{ backgroundColor: '#030712' }} 
            className="w-full h-12 hover:bg-gray-800! rounded-xl text-white font-bold text-base border-none shadow-md mt-6 transition-colors"
          >
            Đăng nhập
          </Button>

          <div className="text-center pt-4 flex justify-between items-center text-sm">
            <span className="text-gray-500">Chưa có tài khoản?</span>
            <div className="font-bold text-gray-950 hover:text-gray-800 transition-colors cursor-pointer">
              Đăng ký
            </div>
          </div>

        </div>
        
      </div>
    </div>
  );
};

export default Login;