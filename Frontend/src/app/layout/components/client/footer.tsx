// import Logo from "../assets/icons/Logo.png";
import { BiLogoFacebook } from "react-icons/bi";
import { FaInstagram } from "react-icons/fa";
import { GrLocation } from "react-icons/gr";
import { FiPhone } from "react-icons/fi";
import { CgMail } from "react-icons/cg";
import {  FaXTwitter } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
const footer = () => {
  return (
    <footer className="bg-gray-950 text-white mt-10 h-100">
      <div className="flex flex-col h-full justify-between">
        <div className="grid grid-cols-4 gap-10 px-7 pt-10 pb-5 pl-20">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 cursor-pointer">
              <p className="text-xl font-bold">Aurora </p>
              <p className="text-xl text-orange-400">Hotel</p>
            </div>

            <div>
              Trải nghiệm nghỉ dưỡng đẳng cấp 5 sao với dịch vụ hoàn hảo và
              không gian sang trọng bậc nhất.
            </div>

            <div className="flex gap-4 text-2xl text-gray-600">
              <div className="bg-gray-700 rounded-lg text-white p-1.5 hover:bg-orange-400 cursor-pointer">
                <BiLogoFacebook />
              </div>
              <div className="bg-gray-700 rounded-lg text-white p-1.5 hover:bg-orange-400 cursor-pointer">
                <FaInstagram />
              </div>
              <div className="bg-gray-700 rounded-lg text-white p-1.5 hover:bg-orange-400 cursor-pointer">
                <FaXTwitter />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="font-bold text-xl">Liên kết nhanh</div>
            <NavLink to="/" className="cursor-pointer w-fit hover:text-orange-400">
              Trang chủ
            </NavLink>
            <NavLink to="/rooms" className="cursor-pointer w-fit hover:text-orange-400">
              Phòng nghỉ
            </NavLink>
            <NavLink to="/my-bookings" className="cursor-pointer w-fit hover:text-orange-400">
              Đặt phòng của tôi
            </NavLink>
          </div>

          <div className="flex flex-col gap-4">
            <div className="font-bold text-xl">Dịch vụ</div>
            <div className="cursor-pointer w-fit hover:text-orange-400">
              Nhà hàng & Bar
            </div>
            <div className="cursor-pointer w-fit hover:text-orange-400">
              Spa & Wellness
            </div>
            <div className="cursor-pointer w-fit hover:text-orange-400">
              Hồ bơi & Gym
            </div>
            <div className="cursor-pointer w-fit hover:text-orange-400">
              Hội nghị & Sự kiện
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="font-bold text-xl">Liên hệ</div>
            <div className="flex items-center gap-2">
              <GrLocation className="text-orange-400" />
              180 Cao Lỗ, Q.8, TP.HCM
            </div>
            <div className="flex items-center gap-2">
              <CgMail className="text-orange-400" />
              hoteline@aurorahotel.com
            </div>
            <div className="flex items-center gap-2">
              <FiPhone className="text-orange-400" />
              +84 123 456 789
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-gray-500 text-lg px-7 pt-7 pb-15 border-t">
          <div>© 2026 Aurora Hotel. All rights reserved.</div>
          <div>Powered by Aurora Hotel</div>
        </div>
      </div>
    </footer>
  );
};

export default footer;
