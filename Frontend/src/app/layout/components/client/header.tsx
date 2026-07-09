import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import Logo from '../../../../assets/icons/Logo.png'
import { NavLink, useNavigate } from "react-router";
import { logout } from '@/features/auth/store/auth-slice';
import {LogoutOutlined} from "@ant-design/icons";
import { FaRegUser } from 'react-icons/fa';
import { Dropdown } from 'antd';
import { SlArrowDown } from 'react-icons/sl';
import { CgProfile } from 'react-icons/cg';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `p-2 rounded-xl transition-colors hover:bg-gray-100 ${
        isActive
            ? 'text-amber-600 bg-amber-50 font-semibold'
            : 'text-gray-600'
    }`;

const header = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const {user, initialized} = useAppSelector(state => state.auth);
    const isAuthenticated = !!user;
    console.log("header user", user);

    const handleLoginRedirect = () => {
        navigate("/login", {replace: true});
    }


    const handleProfileRedirect = () => {
        navigate("/profile", {replace: true});
    }

    const handleBackToHomePage = () => {
        navigate("/", {replace: true});
    }

    const handleStaffManagementRedirect = () => {
        navigate("/staff", {replace: true});
    }

      const menuItems = [
    ...(user?.role === "customer" ? [{
      key: 'profile',
      icon: <CgProfile  />,
      label: 'Trang cá nhân',
      onClick: handleProfileRedirect,
    }] : []),
    ...(user?.role !== "customer" ? [{
        key: 'staff-management',
        icon: <CgProfile  />,
        label: 'Trang quản lý',
        onClick: handleStaffManagementRedirect,
    }] : []),

    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: () => dispatch(logout()),
    },
  ];

    console.log("user", user);

  return (
    <header className='sticky top-0 z-50 bg-white shadow-md'>
        <div className='flex w-full h-20 items-center justify-center relative'>
        <div className="flex justify-between items-center w-full h-16 px-4 pl-10 pr-10 ">
            <div onClick={handleBackToHomePage} className='flex items-center gap-2 cursor-pointer'>
                <img className="h-15 rounded-full" src={Logo} alt="Aurora Hotel Logo" />
                <p className="text-3xl font-bold">Aurora </p>
                <p className="text-3xl text-orange-400">Hotel</p>
            </div>
            <div className='flex gap-8 absolute left-1/2 -translate-x-1/2 text-lg font-medium'>
                <NavLink className={navLinkClass} to="/" end>Trang chủ</NavLink>
                <NavLink className={navLinkClass} to="/rooms">Phòng nghỉ</NavLink>
                <NavLink className={navLinkClass} to="/my-bookings">Đặt phòng của tôi</NavLink>
            </div>
            <div className="flex items-center min-w-30 justify-end">
                        {!initialized ? (
                            
                            <div className="h-6 w-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
                        ) : isAuthenticated ? (
                            
                            // <div className="flex items-center gap-4">
                            //     <span className="text-sm font-medium text-gray-700 hidden md:inline">
                            //         Xin chào, {user?.customers?.full_name || "User"}
                            //     </span>
                            //     <FaRegUser 
                            //         onClick={handleProfileRedirect} 
                            //         className='cursor-pointer text-xl text-orange-500 hover:scale-110 transition-transform' 
                            //         title="Trang cá nhân"
                            //     />
                            //     <button 
                            //         onClick={handleLogout}
                            //         className="text-sm text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                            //     >
                            //         Đăng xuất
                            //     </button>
                            // </div>
                            <div className="flex items-center gap-4 h-full">
                                      <FaRegUser className="text-orange-500 text-4xl" />
                                      <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                                      <div className="flex items-center gap-2 cursor-pointer">
                                        {/* <UserAvatar size={46} /> */}
                            
                                        <div className="flex flex-col leading-tight">
                                          <span className="text-orange-500 text-xl font-medium">
                                            {user?.staff?.full_name || user?.customers?.full_name || "Admin"}
                                          </span>
                                          <span className="text-sm text-right text-gray-400">{user?.role}</span>
                                        </div>
                                        <SlArrowDown className="text-orange-500" />
                                      </div>
                                    </Dropdown>
                                  
                                    </div>
                        ) : (
                            <button 
                                onClick={handleLoginRedirect} 
                                className='bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-base font-medium flex items-center gap-2 transition-colors border-none'
                            >
                                Đăng nhập
                            </button>
                        )}
                    </div>
        </div>
    </div>
    </header>
  )
}

export default header
