import FormModal from "@/app/layout/components/admin/FormModal";
import { useAppSelector } from "@/app/store/hooks";
import { roomPricesApi } from "@/features/admin/adminRoomsPrices/api/roomPrices-api";
import { roomPricesFormFields } from "@/features/admin/adminRoomsPrices/constants/roomPrices-form-fields";
import type { RoomPrice, RoomPriceFormData } from "@/features/admin/adminRoomsPrices/types/roomPrices-type";
import { useFormModal } from "@/shared/hooks/useFormModal";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { Button, Input, Space, Table, type TableProps } from "antd";
import message from "antd/es/message";
import { useCallback, useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { LuWrench } from "react-icons/lu";

const defaultRoomData: RoomPriceFormData = {
  room_type_id: "",
  price_per_day: 0,
  price_per_hour: 0,
  weekend_rate: 0,
  holiday_rate: 0,
  effective_from: "",
  effective_to: "",
};
const ManagerRoomPrices = () => {
  const roomPrices = useFormModal<RoomPrice>();
  const [roomPricesData, setRoomPricesData] = useState<RoomPrice[]>([]);
  const [filteredRoomPrices, setFilteredRoomPrices] = useState<RoomPrice[]>([]);
  const [loading, setLoading] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const fetchRoomPrices = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roomPricesApi.getRoomPricesByBranchId(user?.branch_id || "");
      setRoomPricesData(Array.isArray(data) ? data : []);
      setFilteredRoomPrices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu giá phòng:", error);
      message.error("Không thể tải dữ liệu giá phòng. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoomPrices();
  }, [fetchRoomPrices]);
  console.log("roomPricesData", roomPricesData);

  const handleSubmitForm = async (values: RoomPriceFormData) => {
    if (roomPrices.mode === FormModalModes.CREATE) {
      try {
        await roomPricesApi.createRoomPrice(values);
        message.success("Thêm giá phòng thành công!");
        fetchRoomPrices(); // Tải lại dữ liệu sau khi thêm mới
        roomPrices.close();
      } catch (error) {
        message.error("Có lỗi xảy ra khi thêm giá phòng. Vui lòng thử lại.");
      }
    } else if (
      roomPrices.mode === FormModalModes.UPDATE &&
      roomPrices.selectedRecord
    ) {
      try {
        await roomPricesApi.updateRoomPrice(
          roomPrices.selectedRecord.id,
          values,
        );
        message.success("Cập nhật giá phòng thành công!");
        fetchRoomPrices(); // Tải lại dữ liệu sau khi cập nhật
        roomPrices.close();
      } catch (error) {
        message.error(
          "Có lỗi xảy ra khi cập nhật giá phòng. Vui lòng thử lại.",
        );
      }
    }
  };

  const handleSearch = (searchTern: string) => {
    const filteredData = roomPricesData.filter((item) => item.room_types?.name.toLowerCase().includes(searchTern.toLowerCase()));
    setFilteredRoomPrices(filteredData);
  }
    const columns: TableProps<RoomPrice>["columns"] = [
    {
      title: "Tên loại phòng",
      key: "room_types",
      render: (_, record) => <a>{record.room_types?.name}</a>,
      sorter: (a, b) => a.room_types.name.localeCompare(b.room_types.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Giá theo ngày",
      dataIndex: "price_per_day",
      key: "price_per_day",
      render: (text) => <span>{text?.toLocaleString()} VND</span>,
    },
    {
      title: "Giá theo giờ",
      dataIndex: "price_per_hour",
      key: "price_per_hour",
      render: (text) => <span>{text?.toLocaleString()} VND</span>,
    },
    {
      title: "Tỷ lệ ngày lễ (%)",
      dataIndex: "holiday_rate",
      key: "holiday_rate",
      render: (text) => <span>{text}%</span>,
    },
    {
      title: "Tỷ lệ cuối tuần (%)",
      dataIndex: "weekend_rate",
      key: "weekend_rate",
      render: (text) => <span>{text}%</span>,
    },
    {
      title: "Ngày hiệu lực",
      dataIndex: "effective_from",
      key: "effective_from",
      render: (text) => (
        <span>{text ? new Date(text).toLocaleDateString() : "-"}</span>
      ),
    },
    {
      title: "Ngày hết hiệu lực",
      dataIndex: "effective_to",
      key: "effective_to",
      render: (text) => (
        <span>{text ? new Date(text).toLocaleDateString() : "-"}</span>
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => roomPrices.openEdit(record)} type="primary">
            Chỉnh sửa
          </Button>
          <Button onClick={() => roomPrices.openView(record)} type="dashed">
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];
  return (
    <div className="p-7 flex flex-col gap-5 ">
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-col gap-1">
          <p className="text-3xl font-bold">Quản lý giá phòng</p>
          <p className="text-gray-600">
            Danh sách các giá phòng trong hệ thống khách sạn Aurora
          </p>
        </div>
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => roomPrices.openCreate()}
        >
          <CiCirclePlus /> Thêm giá phòng mới
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">Tổng phòng</span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {Array.isArray(roomPricesData) ? roomPricesData.length : 0}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-green-500">
              Đang hoạt động
            </span>
            <IoIosCheckmarkCircleOutline className="text-green-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {/* {Array.isArray(roomPricesData) ? roomPricesData.filter((item: RoomPrice) => item.is_active).length : 0} */}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-yellow-500">
              Đang bảo trì
            </span>
            <LuWrench className="text-yellow-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold">
            {/* {Array.isArray(roomPricesData) ? roomPricesData.filter((item: RoomPrice) => !item.is_active).length : 0} */}
          </div>
        </div>
      </div>

      <div className="mt-5 border border-gray-300 rounded-lg">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tên loại phòng..."
              prefix={<IoSearch className="text-xl" />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pr-4">
            <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
            <p className="font-lg font-bold text-green-700 rounded-lg">
              {Array.isArray(filteredRoomPrices) ? filteredRoomPrices.length : 0}
            </p>
          </div>
        </div>
        <Table<RoomPrice>
          columns={columns}
          dataSource={filteredRoomPrices}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>

      <FormModal
        isOpen={roomPrices.open}
        onClose={roomPrices.close}
        mode={roomPrices.mode}
        title={
          roomPrices.mode === FormModalModes.CREATE
            ? "Thêm phòng mới"
            : roomPrices.mode === FormModalModes.UPDATE
              ? "Chỉnh sửa phòng"
              : "Chi tiết phòng"
        }
        fields={roomPricesFormFields}
        initialValues={roomPrices.selectedRecord || defaultRoomData}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}

export default ManagerRoomPrices