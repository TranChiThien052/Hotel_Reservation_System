import { FaRegUser } from 'react-icons/fa6'
import test from '../../../../assets/images/Deluxe.jpg'
import { MdStar } from 'react-icons/md'
import { RiRulerLine } from 'react-icons/ri'
import { TbBed } from 'react-icons/tb'


export interface RoomType {
    id: string;
    name: string;
    max_guests: number;
    base_price: number;
    price_display: string;
    description: string;
    images: string[];
}

export interface RoomItem {
    id: string; 
    room_number: string;
    floor: number;
    status: string;
    status_display: string;
    notes: string;
    basic_amenities: string[];
    extra_amenities: string[];
    room_type: RoomType;
}

interface RoomProps {
    room: RoomItem;
}

const room = ({ room }: RoomProps) => {
    const {room_type} = room;
    const defaultImage = room_type.images.length > 0 ? room_type.images[0] : test;
  return (
    <div className='group rounded-xl bg-white border border-gray-300 w-full h-full hover:shadow-2xl transition-shadow duration-300 cursor-pointer'>
        <div className='relative rounded-t-xl h-3/5 overflow-hidden font-bold'>
            <img src={defaultImage} alt={room_type.name} className='h-full w-full object-cover group-hover:scale-110 transition-transform duration-300'/>
            <div className='absolute bottom-4 left-4 flex items-center gap-2 bg-white w-2/6 p-2 rounded-lg'><FaRegUser/> {room_type.max_guests} khách</div>
        </div>
        <div className='flex flex-col gap-2 p-5'>
            <div className='flex text-yellow-400 text-lg'><MdStar /><MdStar /><MdStar /><MdStar /><MdStar /></div>
            <div className='font-bold text-xl'>{room_type.name}</div>
            <div className='flex gap-5 text-gray-600'>
                <div className='flex items-center gap-1'><RiRulerLine />36 m²</div>
                <div className='flex items-center gap-1'><TbBed /> 1 Giường King</div>
            </div>
            <div className='flex items-center'>
                <p className='font-bold text-2xl text-orange-400'>{room_type.price_display}</p>
                <p className='text-gray-500'>/đêm</p>
            </div>
        </div>
    </div>
  )
}

export default room