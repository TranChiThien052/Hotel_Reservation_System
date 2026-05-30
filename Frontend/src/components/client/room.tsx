import { FaRegUser } from 'react-icons/fa6'
import test from '../../assets/images/Deluxe.jpg'
import { MdStar } from 'react-icons/md'
import { RiRulerLine } from 'react-icons/ri'
import { TbBed } from 'react-icons/tb'

const room = () => {
  return (
    <div className='group rounded-xl bg-white border border-gray-300 w-full h-full hover:shadow-2xl transition-shadow duration-300 cursor-pointer'>
        <div className='relative rounded-t-xl overflow-hidden font-bold'>
            <img src={test} alt="Deluxe Room" className='group-hover:scale-110 transition-transform duration-300'/>
            <div className='absolute bottom-4 left-4 flex items-center gap-2 bg-white w-2/6 p-2 rounded-lg'><FaRegUser/> 2 khách</div>
        </div>
        <div className='flex flex-col gap-2 p-5'>
            <div className='flex text-yellow-400 text-lg'><MdStar /><MdStar /><MdStar /><MdStar /><MdStar /></div>
            <div className='font-bold text-xl'>Phòng Deluxe Hướng Biển</div>
            <div className='flex gap-5 text-gray-600'>
                <div className='flex items-center gap-1'><RiRulerLine />36 m²</div>
                <div className='flex items-center gap-1'><TbBed /> 1 Giường King</div>
            </div>
            <div className='flex items-center'>
                <p className='font-bold text-2xl text-orange-400'>1.950.000đ</p>
                <p className='text-gray-500'>/đêm</p>
            </div>
        </div>
    </div>
  )
}

export default room