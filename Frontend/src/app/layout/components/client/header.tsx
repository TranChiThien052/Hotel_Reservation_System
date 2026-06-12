import Logo from '../../../../assets/icons/Logo.png'
import { FaRegCalendarCheck } from 'react-icons/fa6';
import { NavLink } from "react-router";
const header = () => {
  return (
    <header className='sticky top-0 z-50 bg-white shadow-md'>
        <div className='flex w-full h-20 items-center justify-center relative'>
        <div className="flex justify-between items-center w-full h-16 px-4 pl-10 pr-10 ">
            <div className='flex items-center gap-2 cursor-pointer'>
                <img className="h-15 rounded-full" src={Logo} alt="Aurora Hotel Logo" />
                <p className="text-3xl font-bold">Aurora </p>
                <p className="text-3xl text-orange-400">Hotel</p>
            </div>
            <div className='flex gap-8 absolute left-1/2 -translate-x-1/2 text-lg text-gray-600 font-medium'>
                <NavLink className="focus:text-amber-600 focus:bg-amber-50 hover:bg-gray-200 p-2 rounded-xl" to="#">Trang chủ</NavLink>
                <NavLink className="focus:text-amber-600 focus:bg-amber-50 hover:bg-gray-200 p-2 rounded-xl" to="#">Phòng nghỉ</NavLink>
                <NavLink className="focus:text-amber-600 focus:bg-amber-50 hover:bg-gray-200 p-2 rounded-xl" to="#">Đặt phòng của tôi</NavLink>
            </div>
            <div className='bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium flex items-center gap-2'>
                    <FaRegCalendarCheck />
                Đặt phòng ngay
            </div>
        </div>
    </div>
    </header>
  )
}

export default header