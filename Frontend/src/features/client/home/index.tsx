import Banner from "@/assets/images/banner.jpg";
import { IoSearch } from "react-icons/io5";
import Room, { type RoomTypeWithPrice } from "@/app/layout/components/client/room";
import About from "@/assets/images/about.jpg";
import { FaSearch } from "react-icons/fa";
import { useCallback, useEffect, useState } from "react";
import { roomPricesApi } from "@/features/admin/adminRoomsPrices/api/roomPrices-api";
import { roomTypesApi } from "@/features/admin/adminRoomTypes/api/roomTypes-api";
import { useNavigate } from "react-router-dom";
import Wifi from "@/assets/images/WiFi.jpg";
import Restaurant from "@/assets/images/Restaurant.jpg";
import Pool from "@/assets/images/Pool.jpg";
import Spa from "@/assets/images/Spa.jpg";

const index = () => {
  const [roomTypes, setRoomTypes] = useState<RoomTypeWithPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

 const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [rtData, rpData] = await Promise.all([
        roomTypesApi.getRoomTypes(),
        roomPricesApi.getAllRoomprices(),
      ]);

      const rtList: any[] = Array.isArray(rtData) ? rtData : [];
      const rpList: any[] = Array.isArray(rpData) ? rpData : [];

      // Join giá vào từng room type
      const merged: RoomTypeWithPrice[] = rtList
        .filter((rt) => rt.is_active !== false)
        .map((rt) => ({
          ...rt,
          room_price: rpList.find((rp) => rp.room_type_id === rt.id) ?? null,
        }));

      setRoomTypes(merged);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu loại phòng:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loading;
    fetchData();
  }, [fetchData]);

    const handleViewAllRooms = () => {
      navigate("/rooms");
    }
  return (
    <div>
      <div className="relative">
        <img className="w-full" src={Banner} alt="Banner" />
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center ">
          <h1 className="text-6xl font-bold pb-4">Trãi nghiệm nghỉ dưỡng </h1>
          <p className="text-6xl font-bold text-orange-400 pb-4">
            đẳng cấp 5 sao
          </p>
          <p className="text-xl w-full">
            Khám phá không gian sang trọng, dịch vụ hoàn hảo và những khoảnh
            khắc đáng nhớ tại Aurora Hotel
          </p>
        </div>
      </div>

      <div className="bg-gray-50 pt-2 pb-10 text-gray-600">
        <div className="w-2/3 border border-gray-300 rounded-lg mt-10 mx-auto p-4 bg-white shadow-md">
          <div className="grid grid-cols-4 gap-4 p-10 items-center">
            <div className="flex flex-col items-center w-full gap-2 font-bold">
              <p className="text-gray-600">NHẬN PHÒNG</p>
              <input
                className=" cursor-pointer border border-gray-300 bg-gray-100 rounded-lg p-3 w-full hover:border-orange-400"
                type="date"
              />
            </div>
            <div className="flex flex-col items-center w-full gap-2 font-bold">
              <p className="text-gray-600">TRẢ PHÒNG</p>
              <input
                className="cursor-pointer border border-gray-300 bg-gray-100 rounded-lg p-3 w-full hover:border-orange-400"
                type="date"
              />
            </div>
            <div className="flex flex-col items-center w-full gap-2 font-bold">
              <p className="text-gray-600">SỐ KHÁCH</p>
              <select className="cursor-pointer border border-gray-300 bg-gray-100 rounded-lg p-3 w-full hover:border-orange-400">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </div>
            <div className="flex flex-col items-center w-full gap-2 font-bold">
              <p className="text-gray-600">LOẠI PHÒNG</p>
              <select className="cursor-pointer border border-gray-300 bg-gray-100 rounded-lg p-3 w-full hover:border-orange-400">
                <option>Deluxe</option>
                <option>Superior</option>
                <option>Family</option>
                <option>Presidential</option>
              </select>
            </div>
          </div>
          <div className="bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-lg w-full flex items-center justify-center gap-2 font-medium cursor-pointer">
            <IoSearch />
            Tìm phòng trống
          </div>
        </div>
      </div>

      <div className="text-center pt-10 w-full">
        <div className="text-lg font-bold text-orange-400">
          TẠI SAO CHỌN CHÚNG TÔI
        </div>
        <div className="text-4xl font-bold text-gray-800">
          Tiện nghi & Dịch vụ đẳng cấp
        </div>
      </div>

      <div className="grid grid-cols-4 mt-10 w-4/5 mx-auto gap-7">
        <div className="group h-100 flex flex-col items-center border border-gray-100 hover:border-orange-300 hover:border-2 hover:shadow-md rounded-lg bg-gray-100 gap-4 overflow-hidden">
          <img
            className="w-full h-1/2 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            src={Wifi}
            alt="WiFi Tốc độ cao"
          />
          <div className="flex flex-col items-center gap-4 px-4 pb-4">
            <div className="font-bold text-lg">WiFi Tốc độ cao</div>
            <div className="text-gray-800 text-justify">
              Kết nối internet nhanh chóng miễn phí trong toàn bộ khuôn viên
            </div>
          </div>
        </div>

        <div className="group h-100 flex flex-col items-center border border-gray-100 hover:border-orange-300 hover:border-2 hover:shadow-md rounded-lg bg-gray-100 gap-4 overflow-hidden">
          <img
            className="w-full h-1/2 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            src={Restaurant}
            alt="Nhà hàng 5 sao"
          />

          <div className="flex flex-col items-center gap-4 px-4 pb-4">
            <div className="font-bold text-lg">Nhà hàng 5 sao</div>
            <div className="text-gray-800 text-justify">
              Ẩm thực tinh tế với đầu bếp quốc tế và nguyên liệu tươi ngon
            </div>
          </div>
        </div>

        <div className="group h-100 flex flex-col items-center border border-gray-100 hover:border-orange-300 hover:border-2 hover:shadow-md rounded-lg bg-gray-100 gap-4 overflow-hidden">
          <img
            className="w-full h-1/2 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            src={Pool}
            alt="Hồ bơi vô cực"
          />

          <div className="flex flex-col items-center gap-4 px-4 pb-4">
            <div className="font-bold text-lg">Hồ bơi vô cực</div>
            <div className="text-gray-800 text-justify">
              Thư giãn tại hồ bơi vô cực với tầm nhìn toàn cảnh thành phố
            </div>
          </div>
        </div>

        <div className="group h-100 flex flex-col items-center border border-gray-100 hover:border-orange-300 hover:border-2 hover:shadow-md rounded-lg bg-gray-100 gap-4 overflow-hidden">
          <img
            className="w-full h-1/2 object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            src={Spa}
            alt="Spa & Wellness"
          />
          <div className="flex flex-col items-center gap-4 px-4 pb-4">
            <div className="font-bold text-lg">Spa & Wellness</div>
            <div className="text-gray-800 text-justify">
              Liệu pháp chăm sóc sức khỏe và sắc đẹp chuyên nghiệp
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 mt-20 pt-10 pb-10">
        <div className="w-full overflow-hidden">
          <div className="flex justify-between items-center px-10 mb-10">
            <div>
              <p className="font-bold text-orange-400 pb-4">PHÒNG NGHỈ</p>
              <p className="text-4xl font-bold ">Phòng được yêu thích nhất</p>
            </div>
            <div
              className="border-3 rounded-2xl border-orange-400 p-2 text-orange-500 cursor-pointer hover:bg-orange-400 hover:text-white transition-colors duration-300"
              onClick={handleViewAllRooms}
            >
              Xem tất cả phòng
            </div>
          </div>

          <div className="px-10 flex gap-6 overflow-x-auto pb-4 scrollbar-thin">
            {roomTypes.map((room) => (
              <div key={room.id} className="w-75 md:w-87.5 shrink-0">
                <Room room={room} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex mx-15 my-20 rounded-4xl overflow-hidden bg-[#1A1818] text-white">
        <div className="flex flex-col gap-5 px-10 py-20 w-3/5">
          <div className="text-xl font-bold text-orange-400">
            Về Aurora Hotel
          </div>
          <div className="text-4xl font-bold">
            Nơi mỗi kỳ nghỉ đều trở thành kỷ niệm đáng nhớ
          </div>
          <div className="text-gray-300 text-justify">
            Tọa lạc tại trung tâm thành phố, Aurora Hotel mang đến trải nghiệm
            nghỉ dưỡng đẳng cấp với 200 phòng sang trọng, nhà hàng 5 sao, spa
            chuyên nghiệp và dịch vụ tận tâm 24/7.
          </div>
          <div className="grid grid-cols-2 gap-10 mt-10">
            <div>
              <p className="text-3xl font-bold text-orange-400">200+</p>
              <p>Phòng sang trọng</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-400">15K+</p>
              <p>Khách hàng hài lòng</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 mt-10">
            <div>
              <p className="text-3xl font-bold text-orange-400">4.9</p>
              <p>Đánh giá trung bình</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-400">24/7</p>
              <p>Dịch vụ tận tâm</p>
            </div>
          </div>
        </div>

        <div className="w-3/6">
          <img
            src={About}
            alt="About Us"
            className=" w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="w-full px-15 ">
        <div className="relative w-full h-80 rounded-4xl overflow-hidden">
          <img
            src="https://readdy.ai/api/search-image?query=Luxury%20hotel%20rooftop%20terrace%20at%20twilight%2C%20elegant%20outdoor%20seating%20with%20city%20lights%20view%2C%20warm%20ambient%20lighting%2C%20candles%20on%20tables%2C%20romantic%20atmosphere%2C%20modern%20architecture%2C%20professional%20architectural%20photography%2C%20warm%20amber%20tones&width=1200&height=400&seq=hotel-cta-001&orientation=landscape"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-50 w-full h-full"></div>
          <div className="flex flex-col items-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center ">
            <h2 className="text-4xl font-bold pb-4">
              Sẵn sàng cho kỳ nghỉ của bạn?
            </h2>
            <p>Đặt phòng ngay hôm nay để tận hưởng chuyến đi tuyệt vời!</p>
            <div
              onClick={handleViewAllRooms}
              className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-4 rounded-lg text-lg w-1/2 flex items-center justify-center gap-2 font-medium cursor-pointer mt-8"
            >
              <FaSearch />
              Khám phá phòng nghỉ
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
