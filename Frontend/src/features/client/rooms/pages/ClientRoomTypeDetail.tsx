import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomTypesApi } from '@/features/admin/adminRoomTypes/api/roomTypes-api';
import { roomsApi } from '@/features/admin/adminRooms/api/rooms-api';
import { roomPricesApi } from '@/features/admin/adminRoomsPrices/api/roomPrices-api';
import type { RoomType } from '@/features/admin/adminRoomTypes/types/roomsType-type';
import type { RoomItem } from '@/app/layout/components/client/room';
import { MdStar, MdStarHalf, MdStarBorder } from 'react-icons/md';
import { FaRegUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import fallbackImg from '@/assets/images/Deluxe.jpg';

const RATING = 4.5;

const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => {
            if (rating >= s) return <MdStar key={s} className="text-amber-400 text-xl" />;
            if (rating >= s - 0.5) return <MdStarHalf key={s} className="text-amber-400 text-xl" />;
            return <MdStarBorder key={s} className="text-gray-300 text-xl" />;
        })}
        <span className="ml-2 text-gray-600 font-semibold">{rating.toFixed(1)}</span>
    </div>
);

const ClientRoomTypeDetail = () => {
    const { typeId } = useParams<{ typeId: string }>();
    const navigate = useNavigate();

    const [roomType, setRoomType] = useState<RoomType | null>(null);
    const [rooms, setRooms] = useState<RoomItem[]>([]);
    const [price, setPrice] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);

    const fetchData = useCallback(async () => {
        if (!typeId) return;
        setLoading(true);
        try {
            const [rtData, allRooms, allPrices] = await Promise.all([
                roomTypesApi.getRoomTypeById(typeId),
                roomsApi.getAllRooms(),
                roomPricesApi.getAllRoomprices(),
            ]);

            setRoomType(rtData);

            // Lọc phòng thuộc loại này, còn hoạt động
            const relatedRooms: RoomItem[] = (Array.isArray(allRooms) ? allRooms : []).filter(
                (r: any) => r.room_type_id === typeId && r.is_active !== false
            );
            setRooms(relatedRooms);

            // Giá
            const foundPrice = (Array.isArray(allPrices) ? allPrices : []).find(
                (rp: any) => rp.room_type_id === typeId
            );
            setPrice(foundPrice ?? null);
        } catch (err) {
            console.error('Lỗi khi lấy chi tiết loại phòng:', err);
        } finally {
            setLoading(false);
        }
    }, [typeId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500">Đang tải thông tin loại phòng...</p>
            </div>
        </div>
    );

    if (!roomType) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy loại phòng</p>
                <button onClick={() => navigate('/rooms')} className="mt-4 text-amber-600 underline">
                    Quay lại danh sách phòng
                </button>
            </div>
        </div>
    );

    const images = roomType.roomImages ?? [];
    const imgSrc = images.length > 0 ? images[activeImg]?.image_url ?? fallbackImg : fallbackImg;

    const priceNum = price?.price_per_day ? Number(price.price_per_day) : null;
    const priceHour = price?.price_per_hour ? Number(price.price_per_hour) : null;
    const weekendRate = price?.weekend_rate ? Number(price.weekend_rate) : 0;
    const originalPrice = priceNum && weekendRate > 0
        ? Math.round(priceNum / (1 - weekendRate / 100))
        : null;

    // Phòng đang trống (available)
    const availableRooms = rooms.filter((r) => r.status === 'available');
    console.log('Available rooms:', rooms);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Back */}
                <button
                    onClick={() => navigate('/rooms')}
                    className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-6 group"
                >
                    <IoArrowBack className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Quay lại danh sách phòng</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

                    {/* ── Ảnh + Info ── */}
                    <div className="lg:col-span-3 flex flex-col gap-6">

                        {/* Ảnh chính */}
                        <div className="relative bg-gray-100 rounded-2xl overflow-hidden aspect-video">
                            <img
                                src={imgSrc}
                                alt={roomType.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Điều hướng ảnh */}
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                                    >
                                        <FaChevronLeft className="text-gray-700 text-sm" />
                                    </button>
                                    <button
                                        onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                                    >
                                        <FaChevronRight className="text-gray-700 text-sm" />
                                    </button>
                                    {/* Dots */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                        {images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImg(i)}
                                                className={`w-2 h-2 rounded-full transition-colors ${i === activeImg ? 'bg-white' : 'bg-white/50'}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Thumbnail strip */}
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        className={`shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-colors ${i === activeImg ? 'border-amber-400' : 'border-transparent'}`}
                                    >
                                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Thông tin loại phòng */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                    {roomType.name}
                                </span>
                                <StarRating rating={RATING} />
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900">Phòng {roomType.name}</h1>

                            {roomType.branches?.name && (
                                <p className="text-sm text-gray-500">Chi nhánh: <span className="font-semibold text-gray-700">{roomType.branches.name}</span></p>
                            )}

                            {/* Thông tin nhanh */}
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2">
                                <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                    <FaRegUser className="text-amber-500" />
                                    <span>Tối đa <strong>{roomType.max_guests}</strong> khách</span>
                                </div>
                            </div>

                            {/* Mô tả */}
                            {roomType.description && (
                                <p className="text-gray-600 leading-relaxed">{roomType.description}</p>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar: Giá + Đặt phòng ── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Card giá */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24 flex flex-col gap-5">
                            <h2 className="text-lg font-bold text-gray-900">Giá phòng</h2>

                            {priceNum ? (
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-amber-500">{formatVND(priceNum)}</span>
                                        <span className="text-gray-400 text-sm">/ đêm</span>
                                    </div>
                                    {originalPrice && (
                                        <span className="text-sm text-gray-400 line-through">{formatVND(originalPrice)}</span>
                                    )}
                                    {priceHour && (
                                        <p className="text-sm text-gray-500">{formatVND(priceHour)} <span className="text-gray-400">/ giờ</span></p>
                                    )}
                                    {weekendRate > 0 && (
                                        <span className="text-xs text-orange-600 bg-orange-50 border border-orange-200 px-2 py-1 rounded-full w-fit">
                                            +{weekendRate}% cuối tuần
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-sm">Liên hệ để biết giá</p>
                            )}

                            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                                

                                {/* Nút đặt phòng */}
                                <button
                                    disabled={availableRooms.length === 0}
                                    onClick={() => {
                                        const firstRoom = availableRooms[0];
                                        if (firstRoom) navigate(`/booking/${firstRoom.id}`);
                                    }}
                                    className={`w-full py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                                        availableRooms.length > 0
                                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer'
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {availableRooms.length > 0 ? 'Đặt phòng ngay' : 'Hết phòng'}
                                </button>

                                {availableRooms.length > 0 && (
                                    <p className="text-xs text-center text-gray-400">
                                        Phòng sẽ được chọn tự động · Xác nhận ở bước tiếp theo
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ClientRoomTypeDetail;
