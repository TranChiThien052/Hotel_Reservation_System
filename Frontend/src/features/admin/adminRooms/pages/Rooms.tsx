import React, { useCallback, useEffect, useState } from "react";
import type { Room, RoomFormData } from "../types/rooms-type";
import { useFormModal } from "@/shared/hooks/useFormModal";
import { roomsApi } from "../api/rooms-api";
import message from "antd/es/message";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa6";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import {
  Button,
  Dropdown,
  Input,
  Select,
  Space,
  Table,
  Tag,
  type MenuProps,
  type TableProps,
} from "antd";
import { roomsFormFields } from "../constants/rooms-form-fields";
import FormModal from "@/app/layout/components/admin/FormModal";
import { IoSearch } from "react-icons/io5";

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

const Rooms = () => {
  const room = useFormModal<Room>();
  const [roomsData, setRoomsData] = React.useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);

  const [statusValue, setStatusValue] = useState<string | undefined>(undefined);
  const [roomStatusValue, setRoomStatusValue] = useState<string | undefined>(
    undefined,
  );

  const fetchRooms = useCallback(async () => {
    setLoading(true);
    try {
      const data = await roomsApi.getAllRooms();
      setRoomsData(Array.isArray(data) ? data : []);
      setFilteredRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      message.error("Lỗi khi tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  console.log("roomsData", roomsData);

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

  const handleSubmitForm = async (values: RoomFormData) => {
    if (room.mode === FormModalModes.CREATE) {
      // Xử lý tạo mới phòng

      try {
        await roomsApi.createRoom(values);
        message.success("Tạo phòng mới thành công");
        fetchRooms(); // Gọi lại fetchRooms để cập nhật danh sách phòng
        room.close();
      } catch (error) {
        message.error("Tạo phòng mới thất bại");
        console.error("Create error:", error);
      }
    } else if (room.mode === FormModalModes.UPDATE && room.selectedRecord) {
      // Xử lý cập nhật phòng
      try {
        await roomsApi.updateRoom(room.selectedRecord.id, values);
        message.success("Cập nhật phòng thành công");
        fetchRooms(); // Gọi lại fetchRooms để cập nhật danh sách phòng
        room.close();
      } catch (error) {
        message.error("Cập nhật phòng thất bại");
        console.error("Update error:", error);
      }
    }
  };

  const filterStatus = (value: string | undefined) => {
    setStatusValue(value);
    setRoomStatusValue(undefined);

    if (!value) {
      setFilteredRooms(roomsData);
    } else {
      const is_active = value === "active";
      setFilteredRooms(
        roomsData.filter((item) => item.is_active === is_active),
      );
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
          {
            key: "Maintenance",
            label: <span className="text-purple-600">Đang bảo trì</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "maintenance" }),
          }
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
                      : text?.toLowerCase() === "cleaning"
                        ? "blue"
                        : text?.toLowerCase() === "maintenance"
                          ? "purple"
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
                    : text === "maintenance"
                      ? "Đang bảo trì"
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
            label: <span className="text-green-600">Hoạt động</span>,
            onClick: () => handleStatusChange(record.id, { is_active: true }),
          },
          {
            key: "inactive",
            label: <span className="text-red-600">Ngừng hoạt động</span>,
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
              {text ? "Hoạt động" : "Ngừng hoạt động"}
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
          <Button onClick={() => room.openEdit(record)} type="primary">
            Chỉnh sửa
          </Button>
          <Button onClick={() => room.openView(record)} type="dashed">
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
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => room.openCreate()}
        >
          <CiCirclePlus /> Thêm phòng mới
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
                  label: <span className="text-green-600">Hoạt động</span>,
                },
                {
                  value: "inactive",
                  label: <span className="text-red-600">Ngừng hoạt động</span>,
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
                  label: <span className="text-green-600">Khả dụng</span>,
                },
                {
                  value: "occupied",
                  label: <span className="text-yellow-600">Đang sử dụng</span>,
                },
                {
                  value: "unavailable",
                  label: <span className="text-red-600">Không khả dụng</span>,
                },
                {
                  value: "cleaning",
                  label: <span className="text-blue-600">Đang dọn dẹp</span>,
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
        isOpen={room.open}
        onClose={room.close}
        mode={room.mode}
        title={
          room.mode === FormModalModes.CREATE
            ? "Thêm phòng mới"
            : room.mode === FormModalModes.UPDATE
            ? "Chỉnh sửa phòng"
            : "Chi tiết phòng"
        }
        fields={roomsFormFields}
        initialValues={room.selectedRecord || defaultRoomData}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default Rooms;
