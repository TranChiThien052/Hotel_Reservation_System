import { CiCirclePlus } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa6";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import type { RoomType, RoomTypeFormData } from "../types/roomsType-type";
import { useEffect, useState } from "react";
import { Button, Dropdown, message, Space, Table, Tag, type MenuProps, type TableProps} from "antd";
import { useFormModal } from "@/shared/hooks/useFormModal";
import { roomTypesApi } from "../api/roomTypes-api";
import { FormModalModes } from "@/shared/types/type-form-mode";
import FormModal from "@/app/layout/components/admin/FormModal";
import { roomTypeFormFields } from "../constants/roomType-form-fields";

const defaultRoomTypeData: RoomTypeFormData = {
  name: "",
  branch_id: "",
  description: "",
  max_guests: 0,
  images: [],
  is_active: true,
};

const roomTypes = () => {
  const roomType = useFormModal<RoomType>();
  const [roomTypesData, setRoomTypesData] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  const fetchRoomTypes = async () => {
    try {
      const data = await roomTypesApi.getRoomTypes();
      setRoomTypesData(data);
    } catch (error) {
      console.error("Error fetching room types:", error);
      message.error("Lỗi khi tải danh sách loại phòng");
    } 
  };
  fetchRoomTypes();
}, [roomTypesData]);

  const handleStatusChange = async (roomTypeId: string, roomTypeData: any) => {
      setLoading(true);
      try {
        await roomTypesApi.updateRoomType(roomTypeId, roomTypeData);
        setRoomTypesData((prevData) =>
          prevData.map((item) =>
            item.id === roomTypeId
              ? { ...item, is_active: roomTypeData.is_active }
              : item,
          ),
        );
        message.success("Cập nhật trạng thái loại phòng thành công");
      } catch (error) {
        message.error("Cập nhật trạng thái loại phòng thất bại");
        console.error("Update error:", error);
      } finally {
        setLoading(false);
      }
    };

    const handleSubmitForm = async (values: RoomTypeFormData) => {
      if (roomType.mode === FormModalModes.CREATE) {
        // Xử lý tạo mới loại phòng
        try {
          await roomTypesApi.createRoomType(values);
          message.success("Tạo loại phòng mới thành công");
          roomType.close();
        } catch (error) {
          message.error("Tạo loại phòng mới thất bại");
          console.error("Create error:", error);
        }
      } else if (roomType.mode === FormModalModes.UPDATE && roomType.selectedRecord) {
        // Xử lý cập nhật loại phòng
        try {
          await roomTypesApi.updateRoomType(roomType.selectedRecord.id, values);
          message.success("Cập nhật loại phòng thành công");
          roomType.close();
        } catch (error) {
          message.error("Cập nhật loại phòng thất bại");
          console.error("Update error:", error);
        }
      }
    };

  const columns: TableProps<RoomType>["columns"] = [
    {
      title: "",
      dataIndex: "images",
      key: "images",
      // render: (images: String[]) => (
      //   <img src={images[0]} alt="Room" style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "4px" }} />
      // ),
    },
    {
      title: "Room Type Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Branch",
      key: "branches",
      render: (_, record) => <p>{record.branches?.name}</p>,
    },
    {
      title: "Max Guests",
      dataIndex: "max_guests",
      key: "max_guests",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      render: (text, record: RoomType) => {
        // Tạo items động với onClick cho từng branch
        const dynamicStatusItems: MenuProps["items"] = [
          {
            key: "active",
            label: <span className="text-green-600">Active</span>,
            onClick: () => handleStatusChange(record.id, { is_active: true }),
          },
          {
            key: "inactive",
            label: <span className="text-red-600">Inactive</span>,
            onClick: () => handleStatusChange(record.id, { is_active: false }),
          },
        ];

        return (
          <Dropdown
            menu={{ items: dynamicStatusItems }}
            trigger={["click"]} //Click để hiển thị
            placement="bottomLeft"
          >
            <Tag color={text ? "green" : "red"} style={{ cursor: "pointer" }}>
              {text ? "Active" : "Inactive"}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => roomType.openEdit(record)}>
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
            <p className="text-3xl font-bold">Quản lý loại phòng</p>
            <p className="text-gray-600">
              Danh sách các loại phòng trong hệ thống khách sạn Aurora
            </p>
          </div>
          <div
            className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
            onClick={() => roomType.openCreate()}
          >
            <CiCirclePlus /> Thêm loại phòng mới
          </div>
        </div>
  
        <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
          <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-between">
              <span className="font-xl font-bold text-blue-500">
                Tổng loại phòng
              </span>
              <FaRegBuilding className="text-blue-500 text-2xl" />
            </div>
            <div className="text-2xl font-bold ">{roomTypesData.length}</div>
          </div>
  
          <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-between">
              <span className="font-xl font-bold text-green-500">
                Đang hoạt động
              </span>
              <IoIosCheckmarkCircleOutline className="text-green-500 text-2xl" />
            </div>
            <div className="text-2xl font-bold ">
              {roomTypesData.filter((item: RoomType) => item.is_active).length}
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
              {roomTypesData.filter((item: RoomType) => !item.is_active).length}
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
                {roomTypesData.length}
              </p>
            </div>
          </div>
          <Table<RoomType>
            columns={columns}
            pagination={{ pageSize: 5 }}
            dataSource={roomTypesData}
            loading={loading}
          />
        </div>
          <FormModal
          isOpen={roomType.open}
          onClose={roomType.close}
          mode={roomType.mode}
          title={roomType.mode === FormModalModes.CREATE ? "Thêm loại phòng mới" : "Chỉnh sửa loại phòng"}
          fields={roomTypeFormFields}
          initialValues={roomType.selectedRecord || defaultRoomTypeData}
          onSubmit={handleSubmitForm}
          />
      </div>
    );
};

export default roomTypes;
