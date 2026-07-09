import fallbackImg from '../../../../assets/images/Deluxe.jpg';
import { MdStar, MdStarHalf, MdStarBorder } from 'react-icons/md';
import { FaRegUser } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';

// ── Types ─────────────────────────────────────────────────────────────────────
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
    branches?: { name: string };
}

export interface RoomPrice {
    id?: string;
    room_type_id?: string;
    price_per_day: string;
    price_per_hour: string;
    weekend_rate: string;
    holiday_rate?: string;
    effective_from?: string;
    effective_to?: string;
}

// RoomTypeWithPrice — type dùng cho card
export interface RoomTypeWithPrice extends RoomType {
    room_price?: RoomPrice | null;
}

// Giữ lại RoomItem để không bị lỗi import ở các file cũ
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
    room: RoomTypeWithPrice;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const RATING = 4.5;
const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5 text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => {
            if (rating >= star) return <MdStar key={star} className="text-base" />;
            if (rating >= star - 0.5) return <MdStarHalf key={star} className="text-base" />;
            return <MdStarBorder key={star} className="text-base text-gray-300" />;
        })}
        <span className="ml-1 text-sm font-semibold text-gray-600">{rating.toFixed(1)}</span>
    </div>
);

// ── Component ─────────────────────────────────────────────────────────────────
const Room = ({ room: rt }: RoomProps) => {
    const navigate = useNavigate();

    const imgSrc =
        rt.roomImages && rt.roomImages.length > 0 ? rt.roomImages[0].image_url : fallbackImg;

    const priceNum = rt.room_price?.price_per_day
        ? Number(rt.room_price.price_per_day)
        : null;
    const priceHour = rt.room_price?.price_per_hour
        ? Number(rt.room_price.price_per_hour)
        : null;
    const weekendRate = rt.room_price?.weekend_rate
        ? Number(rt.room_price.weekend_rate)
        : 0;
    const originalPrice =
        priceNum && weekendRate > 0
            ? Math.round(priceNum / (1 - weekendRate / 100))
            : null;

    return (
        <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">

            {/* ── Ảnh ── */}
            <div className="relative w-full aspect-video overflow-hidden">
                <img
                    src={imgSrc}
                    alt={rt.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Badge số khách */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow">
                    <FaRegUser className="text-gray-500" />
                    {rt.max_guests} khách
                </div>
                {/* Badge chi nhánh */}
                {rt.branches?.name && (
                    <div className="absolute top-3 left-3 bg-gray-900/75 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1.5 rounded-lg">
                        {rt.branches.name}
                    </div>
                )}
            </div>

            {/* ── Nội dung ── */}
            <div className="p-5 flex flex-col gap-3">

                {/* Badge loại + Stars */}
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        {rt.name}
                    </span>
                    <StarRating rating={RATING} />
                </div>

                {/* Tiêu đề */}
                <h3 className="font-bold text-xl text-gray-900 leading-snug">
                    Phòng {rt.name}
                </h3>

                {/* Mô tả */}
                {rt.description && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                        {rt.description}
                    </p>
                )}

                {/* ── Giá + Nút ── */}
                <div className="flex items-end justify-between pt-3 mt-1 border-t border-gray-100">
                    {/* Giá */}
                    <div>
                        {priceNum ? (
                            <>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-amber-500">
                                        {formatVND(priceNum)}
                                    </span>
                                    {originalPrice && (
                                        <span className="text-sm text-gray-400 line-through">
                                            {formatVND(originalPrice)}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">/ đêm</p>
                            </>
                        ) : (
                            <span className="text-gray-400 text-sm italic">Liên hệ để biết giá</span>
                        )}
                        {priceHour && (
                            <p className="text-xs text-gray-400 mt-0.5">{formatVND(priceHour)} / giờ</p>
                        )}
                    </div>

                    {/* Nút xem chi tiết */}
                    <button
                        onClick={() => navigate(`/rooms/type/${rt.id}`)}
                        className="bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors duration-200 shrink-0 cursor-pointer"
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Room;