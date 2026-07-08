import fallbackImg from '../../../../assets/images/Deluxe.jpg'
import { MdStar, MdStarHalf, MdStarBorder } from 'react-icons/md'
import { RiRulerLine } from 'react-icons/ri'
import { TbBed } from 'react-icons/tb'
import { FaRegUser } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'


export interface RoomImage {
    image_url: string;
    image_public_id: string;
}

export interface RoomType {
    id: string;
    name: string;
    description: string | null;
    max_guests: number;
    is_active: boolean;
    roomImages?: RoomImage[];
}

export interface RoomPrice {
    id: string;
    room_type_id: string;
    price_per_day: string;
    price_per_hour: string;
    weekend_rate: string;
    holiday_rate: string;
    effective_from: string;
    effective_to: string;
}

export interface RoomItem {
    id: string;
    branch_id: string;
    room_type_id: string;
    room_number: string;
    floor: number;
    status: string;
    notes?: string;
    basic: string[];
    extra?: string[];
    is_active: boolean;
    room_types: RoomType;
    room_price?: RoomPrice | null;
}

interface RoomProps {
    room: RoomItem;
}

// Số sao hiển thị (cố định 4.5 sao vì API không trả về rating)
const RATING = 4.5;
const MAX_AMENITY_TAGS = 4; // Số tag hiện trước khi ẩn bớt

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex items-center gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map((star) => {
                if (rating >= star) return <MdStar key={star} className="text-base" />;
                if (rating >= star - 0.5) return <MdStarHalf key={star} className="text-base" />;
                return <MdStarBorder key={star} className="text-base text-gray-300" />;
            })}
            <span className="ml-1 text-sm font-semibold text-gray-600">{rating.toFixed(1)}</span>
        </div>
    );
};

const Room = ({ room }: RoomProps) => {
    const navigate = useNavigate();
    const roomType = room.room_types;
    const images = roomType?.roomImages ?? [];
    const defaultImage = images.length > 0 ? images[0].image_url : fallbackImg;

    // Tất cả tiện ích gộp từ basic + extra
    const allAmenities = [...(room.basic ?? []), ...(room.extra ?? [])];
    const visibleAmenities = allAmenities.slice(0, MAX_AMENITY_TAGS);
    const hiddenCount = allAmenities.length - MAX_AMENITY_TAGS;

    // Giá thực (price_per_day)
    const priceNum = room.room_price?.price_per_day
        ? Number(room.room_price.price_per_day)
        : null;

    // Giá gốc (trước khi áp dụng weekend_rate nếu có)
    const weekendRate = room.room_price?.weekend_rate
        ? Number(room.room_price.weekend_rate)
        : 0;
        console.log('weekendRate', weekendRate)
    const originalPriceNum =
        priceNum && weekendRate > 0
            ? Math.round(priceNum / (1 - weekendRate / 100))
            : null;

    const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

    return (
        <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer">

            {/* ── Ảnh ── */}
            <div className="relative w-full aspect-video overflow-hidden">
                <img
                    src={defaultImage}
                    alt={roomType?.name ?? 'Phòng'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge số khách */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow">
                    <FaRegUser className="text-gray-500" />
                    {roomType?.max_guests ?? '?'} khách
                </div>
            </div>

            {/* ── Nội dung ── */}
            <div className="p-5 flex flex-col gap-3">

                {/* Hàng 1: Badge loại phòng + Stars */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        {roomType?.name}
                    </span>
                    <StarRating rating={RATING} />
                </div>

                {/* Tên phòng */}
                <h3 className="font-bold text-xl text-gray-900 leading-snug">
                    Phòng {roomType?.name}
                </h3>

                {/* Thông tin nhanh: tầng + tiện ích cơ bản */}
                <div className="flex flex-wrap gap-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-1.5">
                        <RiRulerLine className="text-gray-400" />
                        <span>Tầng {room.floor}</span>
                    </div>
                    {room.basic?.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            <TbBed className="text-gray-400" />
                            <span>{room.basic[0]}</span>
                        </div>
                    )}
                </div>

                {/* Mô tả */}
                {roomType?.description && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {roomType.description}
                    </p>
                )}

                {/* Tiện ích tags */}
                {allAmenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {visibleAmenities.map((amenity) => (
                            <span
                                key={amenity}
                                className="text-xs text-gray-600 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full"
                            >
                                {amenity}
                            </span>
                        ))}
                        {hiddenCount > 0 && (
                            <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                                +{hiddenCount}
                            </span>
                        )}
                    </div>
                )}

                {/* ── Giá + Nút ── */}
                <div className="flex items-end justify-between pt-3 mt-1 border-t border-gray-100">
                    {/* Giá */}
                    <div>
                        {priceNum ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-amber-500">
                                    {formatVND(priceNum)}
                                </span>
                                {originalPriceNum && (
                                    <span className="text-sm text-gray-400 line-through">
                                        {formatVND(originalPriceNum)}
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-gray-400 text-sm italic">Liên hệ để biết giá</span>
                        )}
                        {priceNum && (
                            <p className="text-xs text-gray-400 mt-0.5">/ đêm</p>
                        )}
                    </div>

                    {/* Nút xem chi tiết */}
                    <button
                        onClick={() => navigate(`/rooms/${room.id}`)}
                        className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200 shrink-0"
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Room;