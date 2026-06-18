import { useFormModal } from "@/shared/hooks/useFormModal";
import type { RoomPrice, RoomPriceFormData } from "../types/roomPrices-type";
import { useEffect, useState } from "react";
import { roomPricesApi } from "../api/roomPrices-api";
import { Button, message, Space, Table, type TableProps } from "antd";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import { roomPricesFormFields } from "../constants/roomPrices-form-fields";
import FormModal from "@/app/layout/components/admin/FormModal";

const defaultRoomData: RoomPriceFormData = {
    room_type_id: "",
    price_per_night: 0,
    price_per_hour: 0,
    weekend_rate: 0,
    holiday_rate: 0,
    effective_from: "",
    effective_to: "",
}

const RoomPrices = () => {

    const roomPrices = useFormModal<RoomPrice>();
    const [roomPricesData, setRoomPricesData] = useState<RoomPrice[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRoomPrices = async () => {
            try {
                const data = await roomPricesApi.getAllRoomprices();
                setRoomPricesData(data);
            }catch (error) {
                console.error("Lỗi khi lấy dữ liệu giá phòng:", error);
                message.error("Không thể tải dữ liệu giá phòng. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        }
        fetchRoomPrices();
    }, [roomPricesData]);

    const handleSubmitForm = async (values: RoomPriceFormData) => {
        if (roomPrices.mode === FormModalModes.CREATE) {
            try {
                await roomPricesApi.createRoomPrice(values);
                message.success("Thêm giá phòng thành công!");
                roomPrices.close();
            } catch (error) {
                message.error("Có lỗi xảy ra khi thêm giá phòng. Vui lòng thử lại.");
            }
        } else if (roomPrices.mode === FormModalModes.UPDATE && roomPrices.selectedRecord) {
            try {
                await roomPricesApi.updateRoomPrice(roomPrices.selectedRecord.id, values);
                message.success("Cập nhật giá phòng thành công!");
                roomPrices.close();
            } catch (error) {
                message.error("Có lỗi xảy ra khi cập nhật giá phòng. Vui lòng thử lại.");
            }
    }
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
      title: "Giá theo đêm",
      dataIndex: "price_per_night",
      key: "price_per_night",
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
      render: (text) => <span>{text ? new Date(text).toLocaleDateString() : "-"}</span>,
    },
    {
      title: "Ngày hết hiệu lực",
      dataIndex: "effective_to",
      key: "effective_to",
      render: (text) => <span>{text ? new Date(text).toLocaleDateString() : "-"}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => roomPrices.openEdit(record)}>
            Edit
          </Button>
        </Space>
      ),
    },
  ];
  return (
      <div className="p-7 flex flex-col gap-5 ">
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-bold">Quản lý phòng</p>
            <p className="text-gray-600">
              Danh sách các phòng trong hệ thống khách sạn Aurora
            </p>
          </div>
          <div
            className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
            onClick={() => roomPrices.openCreate()}
          >
            <CiCirclePlus /> Thêm phòng mới
          </div>
        </div>
  
        <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
          <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-between">
              <span className="font-xl font-bold text-blue-500">
                Tổng phòng
              </span>
              <FaRegBuilding className="text-blue-500 text-2xl" />
            </div>
            <div className="text-2xl font-bold ">{roomPricesData.length}</div>
          </div>
  
          <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-between">
              <span className="font-xl font-bold text-green-500">
                Đang hoạt động
              </span>
              <IoIosCheckmarkCircleOutline className="text-green-500 text-2xl" />
            </div>
            <div className="text-2xl font-bold ">
              {/* {roomPricesData.filter((item: RoomPrice) => item.is_active).length} */}
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
              {/* {roomsData.filter((item: Room) => !item.is_active).length} */}
            </div>
          </div>
        </div>
  
        <div className="mt-5 border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
            <div className="flex items-center gap-4">
              {/* <div className="font-lg font-bold text-gray-700 border border-gray-300 p-2 rounded-lg">Trạng thái</div> */}
              {/* <Dropdown
                menu={{ items: status }}
                placement="topRight"
                arrow={{ pointAtCenter: true }}
              >
                <Button>
                  Trạng thái <FaCaretDown />
                </Button>
              </Dropdown>
              <Dropdown
                menu={{ items: status }}
                placement="topRight"
                arrow={{ pointAtCenter: true }}
              >
                <Button>
                  Trạng thái <FaCaretDown />
                </Button>
              </Dropdown> */}
            </div>
            <div className="flex items-center gap-3 pr-4">
              <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
              <p className="font-lg font-bold text-green-700 rounded-lg">
                {roomPricesData.length}
              </p>
            </div>
          </div>
          <Table<RoomPrice>
            columns={columns}
            dataSource={roomPricesData}
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </div>
  
          <FormModal
          isOpen={roomPrices.open}
          onClose={roomPrices.close}
          mode={roomPrices.mode}
          title={roomPrices.mode === FormModalModes.CREATE ? "Thêm phòng mới" : "Chỉnh sửa phòng"}
          fields={roomPricesFormFields}
          initialValues={roomPrices.selectedRecord || defaultRoomData}
          onSubmit={handleSubmitForm}
          />
      </div>
    );
}

export default RoomPrices;