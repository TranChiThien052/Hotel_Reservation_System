import Banner from "../../assets/images/banner.jpg";
import demo from "../../assets/images/Deluxe.jpg";
import { IoSearch } from "react-icons/io5";
import Room from "../../components/client/room";

const index = () => {
  return (
    <div>
      {/* Banner */}
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
        {/* Tìm phòng trống */}
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
        <div className="group flex flex-col items-center border border-gray-100 hover:border-orange-300 hover:border-2 hover:shadow-md rounded-lg bg-gray-100 gap-4 overflow-hidden">
          <img
            className="w-full h-auto rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            src={demo}
            alt="Deluxe Room"
          />
          <div className="flex flex-col items-center gap-4 px-4 pb-4">
            <div className="font-bold text-lg">WiFi Tốc độ cao</div>
            <div className="text-gray-800 text-justify">
              Kết nối internet nhanh chóng miễn phí trong toàn bộ khuôn viên
            </div>
          </div>
        </div>

        <div className="group flex flex-col items-center border border-gray-100 hover:border-orange-300 hover:border-2 hover:shadow-md rounded-lg bg-gray-100 gap-4 overflow-hidden">
          <img
            className="w-full h-auto rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            src={demo}
            alt="Deluxe Room"
          />

          <div className="flex flex-col items-center gap-4 px-4 pb-4">
            <div className="font-bold text-lg">Nhà hàng 5 sao</div>
            <div className="text-gray-800 text-justify">
              Ẩm thực tinh tế với đầu bếp quốc tế và nguyên liệu tươi ngon
            </div>
          </div>
        </div>

        <div className="group flex flex-col items-center border border-gray-100 hover:border-orange-300 hover:border-2 hover:shadow-md rounded-lg bg-gray-100 gap-4 overflow-hidden">
          <img
            className="w-full h-auto rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            src={demo}
            alt="Deluxe Room"
          />

          <div className="flex flex-col items-center gap-4 px-4 pb-4">
            <div className="font-bold text-lg">Hồ bơi vô cực</div>
            <div className="text-gray-800 text-justify">
              Thư giãn tại hồ bơi vô cực với tầm nhìn toàn cảnh thành phố
            </div>
          </div>
        </div>

        <div className="group flex flex-col items-center border border-gray-100 hover:border-orange-300 hover:border-2 hover:shadow-md rounded-lg bg-gray-100 gap-4 overflow-hidden">
          <img
            className="w-full h-auto rounded-t-lg group-hover:scale-105 transition-transform duration-300"
            src={demo}
            alt="Deluxe Room"
          />
          <div className="flex flex-col items-center gap-4 px-4 pb-4">
            <div className="font-bold text-lg">Spa & Wellness</div>
            <div className="text-gray-800 text-justify">
              Liệu pháp chăm sóc sức khỏe và sắc đẹp chuyên nghiệp
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 mt-20 pt-10 pb-20">
        <div>
          <div className="flex justify-between items-center px-10 mb-10">
            <div>
              <p className="font-bold text-orange-400 pb-4">PHÒNG NGHỈ</p>
              <p className="text-4xl font-bold ">Phòng được yêu thích nhất</p>
            </div>
            <div className="border-3 rounded-2xl border-orange-400 p-2 text-orange-500 cursor-pointer hover:bg-orange-400 hover:text-white transition-colors duration-300">
              Xem tất cả phòng
            </div>
          </div>

          <div className="px-10 grid grid-cols-4 gap-7">
            <Room/>
            <Room/>
            <Room/>
            <Room/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default index;
