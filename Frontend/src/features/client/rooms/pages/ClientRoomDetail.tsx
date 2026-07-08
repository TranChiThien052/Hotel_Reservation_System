import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { roomsApi } from '@/features/admin/adminRooms/api/rooms-api';
import { roomTypesApi } from '@/features/admin/adminRoomTypes/api/roomTypes-api';
import { roomPricesApi } from '@/features/admin/adminRoomsPrices/api/roomPrices-api';
import type { RoomItem, RoomImage } from '@/app/layout/components/client/room';
import { MdStar, MdStarHalf, MdStarBorder } from 'react-icons/md';
import { FaRegUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import { RiRulerLine } from 'react-icons/ri';
import { TbBed } from 'react-icons/tb';
import { IoArrowBack } from 'react-icons/io5';
import fallbackImg from '@/assets/images/Deluxe.jpg';

const RATING = 4.5;

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

const ClientRoomDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [room, setRoom] = useState<RoomItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImg, setActiveImg] = useState(0);

    const fetchDetail = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [roomData, roomTypesData, roomPricesData] = await Promise.all([
                roomsApi.getRoomById(id),
                roomTypesApi.getRoomTypes(),
                roomPricesApi.getAllRoomprices(),
            ]);

            const roomTypesList: any[] = Array.isArray(roomTypesData) ? roomTypesData : [];
            const roomPricesList: any[] = Array.isArray(roomPricesData) ? roomPricesData : [];

            const roomTypeMap = new Map<string, any>(roomTypesList.map((rt) => [rt.id, rt]));

            const rtFromApi = roomData.room_types ?? {};
            const rtFull = roomTypeMap.get(roomData.room_type_id) ?? rtFromApi;

            const merged: RoomItem = {
                ...roomData,
                room_types: { ...rtFromApi, roomImages: rtFull.roomImages ?? [] },
                room_price: roomPricesList.find((rp: any) => rp.room_type_id === roomData.room_type_id) ?? null,
            };

            setRoom(merged);
        } catch (err) {
            console.error('Lỗi khi lấy chi tiết phòng:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500">Đang tải thông tin phòng...</p>
            </div>
        </div>
    );

    if (!room) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <p className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy phòng</p>
                <button onClick={() => navigate('/rooms')} className="mt-4 text-amber-600 underline">Quay lại danh sách phòng</button>
            </div>
        </div>
    );

    const roomType = room.room_types;
    const images: RoomImage[] = roomType?.roomImages ?? [];
    const imgSrcs = images.length > 0 ? images.map(i => i.image_url) : [fallbackImg];

    const allAmenities = [...(room.basic ?? []), ...(room.extra ?? [])];

    const priceNum = room.room_price?.price_per_day ? Number(room.room_price.price_per_day) : null;
    const priceHour = room.room_price?.price_per_hour ? Number(room.room_price.price_per_hour) : null;
    const weekendRate = room.room_price?.weekend_rate ? Number(room.room_price.weekend_rate) : 0;
    const originalPriceNum = priceNum && weekendRate > 0
        ? Math.round(priceNum / (1 - weekendRate / 100))
        : null;
    const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

    const prevImg = () => setActiveImg((p) => (p - 1 + imgSrcs.length) % imgSrcs.length);
    const nextImg = () => setActiveImg((p) => (p + 1) % imgSrcs.length);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* ── Back ── */}
                <button
                    onClick={() => navigate('/rooms')}
                    className="flex items-center gap-2 text-gray-500 hover:text-amber-600 transition-colors mb-6 group"
                >
                    <IoArrowBack className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Quay lại danh sách phòng</span>
                </button>

                {/* ── Header info ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                            {roomType?.name}
                        </span>
                        <h1 className="mt-3 text-3xl font-bold text-gray-900">
                            Phòng {roomType?.name} — {room.room_number}
                        </h1>
                        <div className="flex flex-wrap gap-4 mt-2 text-gray-500 text-sm">
                            <div className="flex items-center gap-1.5">
                                <RiRulerLine />
                                <span>Tầng {room.floor}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <FaRegUser />
                                <span>Tối đa {roomType?.max_guests} khách</span>
                            </div>
                            {room.basic?.[0] && (
                                <div className="flex items-center gap-1.5">
                                    <TbBed />
                                    <span>{room.basic[0]}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <StarRating rating={RATING} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Cột trái: Gallery + Chi tiết ── */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Gallery */}
                        <div className="rounded-2xl overflow-hidden shadow-md">
                            {/* Ảnh chính */}
                            <div className="relative aspect-video bg-gray-200">
                                <img
                                    src={imgSrcs[activeImg]}
                                    alt={`${roomType?.name} - ${activeImg + 1}`}
                                    className="w-full h-full object-cover transition-opacity duration-300"
                                />
                                {imgSrcs.length > 1 && (
                                    <>
                                        <button
                                            onClick={prevImg}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-colors"
                                        >
                                            <FaChevronLeft />
                                        </button>
                                        <button
                                            onClick={nextImg}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full transition-colors"
                                        >
                                            <FaChevronRight />
                                        </button>
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {imgSrcs.map((_, i) => (
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
                            {imgSrcs.length > 1 && (
                                <div className="flex gap-2 p-3 bg-white overflow-x-auto">
                                    {imgSrcs.map((src, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImg(i)}
                                            className={`shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                                                i === activeImg ? 'border-amber-500' : 'border-transparent'
                                            }`}
                                        >
                                            <img src={src} className="w-full h-full object-cover" alt={`thumb-${i}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mô tả */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-3">Mô tả phòng</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {roomType?.description || 'Phòng sang trọng với đầy đủ tiện nghi hiện đại, mang đến trải nghiệm nghỉ dưỡng tuyệt vời.'}
                            </p>
                            {room.notes && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                                    {room.notes}
                                </div>
                            )}
                        </div>

                        {/* Tiện ích */}
                        {allAmenities.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Tiện nghi phòng</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {allAmenities.map((amenity) => (
                                        <div
                                            key={amenity}
                                            className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700"
                                        >
                                            {amenity}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Cột phải: Giá + Đặt phòng ── */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24 flex flex-col gap-5">

                            {/* Giá */}
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Giá phòng</p>
                                {priceNum ? (
                                    <>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-amber-500">{formatVND(priceNum)}</span>
                                            {originalPriceNum && (
                                                <span className="text-base text-gray-400 line-through">{formatVND(originalPriceNum)}</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400">/ đêm</p>
                                        {priceHour && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Theo giờ: <span className="font-semibold text-gray-700">{formatVND(priceHour)}</span> / giờ
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-gray-400 italic">Liên hệ để biết giá</p>
                                )}
                            </div>

                            <hr className="border-gray-100" />

                            {/* Thông tin phòng tóm tắt */}
                            <div className="flex flex-col gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số phòng</span>
                                    <span className="font-semibold text-gray-800">{room.room_number}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tầng</span>
                                    <span className="font-semibold text-gray-800">{room.floor}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Loại phòng</span>
                                    <span className="font-semibold text-gray-800">{roomType?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Sức chứa</span>
                                    <span className="font-semibold text-gray-800">{roomType?.max_guests} khách</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500">Trạng thái</span>
                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        room.status === 'available'
                                            ? 'text-green-700 bg-green-50 border border-green-200'
                                            : 'text-red-600 bg-red-50 border border-red-200'
                                    }`}>
                                        {room.status === 'available' ? 'Còn trống' : 'Đã đặt'}
                                    </span>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            {/* Nút đặt phòng */}
                            <button
                                disabled={room.status !== 'available'}
                                onClick={() => navigate(`/booking/${room.id}`)}
                                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-colors duration-200 text-base"
                            >
                                {room.status === 'available' ? 'Đặt phòng ngay' : 'Phòng không khả dụng'}
                            </button>

                            <p className="text-xs text-center text-gray-400">
                                Miễn phí hủy trong vòng 24h sau khi đặt
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientRoomDetail;