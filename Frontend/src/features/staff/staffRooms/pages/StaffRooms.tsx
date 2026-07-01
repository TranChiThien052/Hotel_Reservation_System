import FormModal from "@/app/layout/components/admin/FormModal";
import { roomsApi } from "@/features/admin/adminRooms/api/rooms-api";
import { roomsFormFields } from "@/features/admin/adminRooms/constants/rooms-form-fields";
import type { Room, RoomFormData } from "@/features/admin/adminRooms/types/rooms-type";
import { useFormModal } from "@/shared/hooks/useFormModal";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { Button, Dropdown, Input, message, Select, Space, Table, Tag, type MenuProps, type TableProps } from "antd";
import { useCallback, useEffect, useState } from "react";
import { FaRegBuilding } from "react-icons/fa6";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { LuWrench } from "react-icons/lu";


const defaultRoomData: RoomFormData = {
  branch_id: "",
  room_type_id: "",
  room_number: "",
  floor: 0,
  is_active: true,
  basic: [],
  extra: [],
  status: "available",
};



const StaffRooms = () => {

    const staffRooms = useFormModal<Room>();

    const [roomsData, setRoomsData] = useState<Room[]>([]);
    const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const [statusValue, setStatusValue] = useState<string | undefined>(undefined);
    const [roomStatusValue, setRoomStatusValue] = useState<string | undefined>(undefined);

    const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
        const data = await roomsApi.getAllRooms();
        setRoomsData(Array.isArray(data) ? data : []);
        setFilteredRooms(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error("Error fetching rooms:", error);
        message.error("Đã xảy ra lỗi khi tải danh sách phòng. Vui lòng thử lại.");
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    fetchRooms();
}, [fetchRooms]);

const filterStatus = (value: string | undefined) => {
    setStatusValue(value);
    setRoomStatusValue(undefined);

    if (!value) {
        setFilteredRooms(roomsData);
    } else {
        const is_active = value === "active";
        setFilteredRooms(roomsData.filter((room) => room.is_active === is_active));
    }
};

const filterRoomStatus = (value: string | undefined) => {
    setRoomStatusValue(value);
    setStatusValue(undefined);

    if (!value) {
        setFilteredRooms(roomsData);
    } else {
        setFilteredRooms(roomsData.filter((room) => room.status === value));
    }
};

const handleSearch = (searchTerm: string) => {
    const filtered = roomsData.filter(
      (room) =>
        room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.branches?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.room_types?.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredRooms(filtered);
  };

  const handleStatusChange = async (roomId: string, roomData: any) => {
    setLoading(true);
    try {
      await roomsApi.updateRoom(roomId, roomData);
      setRoomsData((prevData) =>
        prevData.map((item) =>
          item.id === roomId
            ? { ...item, is_active: roomData.is_active }
            : item,
        ),
      );
      message.success("Cập nhật trạng thái phòng thành công");
      fetchRooms(); // Gọi lại fetchRooms để cập nhật danh sách phòng sau khi thay đổi trạng thái
    } catch (error) {
      message.error("Cập nhật trạng thái phòng thất bại");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

const columns: TableProps<Room>["columns"] = [
    {
      title: "Số phòng",
      dataIndex: "room_number",
      key: "room_number",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.room_number.localeCompare(b.room_number),
      defaultSortOrder: "ascend",
    },
    {
      title: "Loại phòng",
      key: "room_types",
      render: (_, record) => <p>{record.room_types?.name}</p>,
    },
    {
      title: "Chi nhánh",
      key: "branches",
      render: (_, record) => <p>{record.branches?.name}</p>,
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (text, record: Room) => {
        // Tạo items động với onClick cho từng branch
        const dynamicStatusItems: MenuProps["items"] = [
          {
            key: "Available",
            label: <span className="text-green-600">Khả dụng</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "available" }),
          },
          {
            key: "Unavailable",
            label: <span className="text-red-600">Không khả dụng</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "unavailable" }),
          },
          {
            key: "Occupied",
            label: <span className="text-yellow-600">Đang sử dụng</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "occupied" }),
          },
          {
            key: "Cleaning",
            label: <span className="text-blue-600">Đang dọn dẹp</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "cleaning" }),
          },
        ];

        return (
          <Dropdown
            menu={{ items: dynamicStatusItems }}
            trigger={["click"]} //Click để hiển thị
            placement="bottomLeft"
          >
            <Tag
              color={
                text?.toLowerCase() === "occupied"
                  ? "yellow"
                  : text?.toLowerCase() === "available"
                    ? "green"
                    : text?.toLowerCase() === "unavailable"
                      ? "red"
                      : "blue"
              }
              style={{ cursor: "pointer" }}
            >
              {text === "available"
                ? "Khả dụng"
                : text === "unavailable"
                  ? "Không khả dụng"
                  : text === "occupied"
                    ? "Đang sử dụng"
                    : "Đang dọn dẹp"}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "is_active",
      dataIndex: "is_active",
      render: (text, record: Room) => {
        // Tạo items động với onClick cho từng branch
        const dynamicStatusItems: MenuProps["items"] = [
          {
            key: "active",
            label: <span className="text-green-600">Đang hoạt động</span>,
            onClick: () => handleStatusChange(record.id, { is_active: true }),
          },
          {
            key: "inactive",
            label: <span className="text-red-600">Không hoạt động</span>,
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
              {text ? "Đang hoạt động" : "Không hoạt động"}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => staffRooms.openView(record)} type="dashed">
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
          <p className="text-3xl font-bold">Quản lý phòng</p>
          <p className="text-gray-600">
            Danh sách các phòng trong hệ thống khách sạn Aurora
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">Tổng phòng</span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {Array.isArray(roomsData) ? roomsData.length : 0}
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
            {Array.isArray(roomsData)
              ? roomsData.filter((item: Room) => item.is_active).length
              : 0}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-yellow-500">
              Ngưng hoạt động
            </span>
            <LuWrench className="text-yellow-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold">
            {Array.isArray(roomsData)
              ? roomsData.filter((item: Room) => !item.is_active).length
              : 0}
          </div>
        </div>
      </div>

      <div className="mt-5 border border-gray-300 rounded-lg">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
          <div className="flex items-center gap-4">
            <Select
              placeholder="Trạng thái"
              placement="topRight"
              style={{ width: 120 }}
              onChange={filterStatus}
              allowClear
              value={statusValue}
              options={[
                {
                  value: "active",
                  label: <span className="text-green-600">Active</span>,
                },
                {
                  value: "inactive",
                  label: <span className="text-red-600">Inactive</span>,
                },
              ]}
            />

            <Select
              placeholder="Tình trạng"
              placement="topRight"
              style={{ width: 120 }}
              onChange={filterRoomStatus}
              allowClear
              value={roomStatusValue}
              options={[
                {
                  value: "available",
                  label: <span className="text-green-600">Available</span>,
                },
                {
                  value: "occupied",
                  label: <span className="text-yellow-600">Occupied</span>,
                },
                {
                  value: "unavailable",
                  label: <span className="text-red-600">Unavailable</span>,
                },
                {
                  value: "cleaning",
                  label: <span className="text-blue-600">Cleaning</span>,
                },
              ]}
            />

            <Input
              placeholder="Tìm kiếm..."
              prefix={<IoSearch className="text-xl" />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pr-4">
            <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
            <p className="font-lg font-bold text-green-700 rounded-lg">
              {Array.isArray(filteredRooms) ? filteredRooms.length : 0}
            </p>
          </div>
        </div>
        <Table<Room>
          columns={columns}
          dataSource={filteredRooms}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>

      <FormModal
        isOpen={staffRooms.open}
        onClose={staffRooms.close}
        mode={staffRooms.mode}
        title={
          staffRooms.mode === FormModalModes.VIEW
            ? "Chi tiết phòng"
            : ""
        }
        fields={roomsFormFields}
        initialValues={staffRooms.selectedRecord || defaultRoomData}
      />
    </div>
  );
}

export default StaffRooms