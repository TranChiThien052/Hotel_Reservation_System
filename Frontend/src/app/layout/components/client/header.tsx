import { useAppDispatch } from '@/app/store/hooks';
import Logo from '../../../../assets/icons/Logo.png'
import { NavLink, useNavigate } from "react-router";
import { logout } from '@/features/auth/store/auth-slice';
const header = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate("/login", {replace: true});
        dispatch(logout());
    }

    const handleBackToHomePage = () => {
        navigate("/", {replace: true});
    }

  return (
    <header className='sticky top-0 z-50 bg-white shadow-md'>
        <div className='flex w-full h-20 items-center justify-center relative'>
        <div className="flex justify-between items-center w-full h-16 px-4 pl-10 pr-10 ">
            <div onClick={handleBackToHomePage} className='flex items-center gap-2 cursor-pointer'>
                <img className="h-15 rounded-full" src={Logo} alt="Aurora Hotel Logo" />
                <p className="text-3xl font-bold">Aurora </p>
                <p className="text-3xl text-orange-400">Hotel</p>
            </div>
            <div className='flex gap-8 absolute left-1/2 -translate-x-1/2 text-lg text-gray-600 font-medium'>
                <NavLink className="focus:text-amber-600 focus:bg-amber-50 hover:bg-gray-200 p-2 rounded-xl" to="#">Trang chủ</NavLink>
                <NavLink className="focus:text-amber-600 focus:bg-amber-50 hover:bg-gray-200 p-2 rounded-xl" to="#">Phòng nghỉ</NavLink>
                <NavLink className="focus:text-amber-600 focus:bg-amber-50 hover:bg-gray-200 p-2 rounded-xl" to="#">Đặt phòng của tôi</NavLink>
            </div>
            <div onClick={handleLogin} className='bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium flex items-center gap-2'>
                Đăng nhập
            </div>
        </div>
    </div>
    </header>
  )
}

export default header