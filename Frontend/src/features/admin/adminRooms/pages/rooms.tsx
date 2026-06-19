import React, { useEffect, useState } from 'react'
import type { Room, RoomFormData } from '../types/rooms-type';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { roomsApi } from '../api/rooms-api';
import message from 'antd/es/message';
import { FormModalModes } from '@/shared/types/type-form-mode';
import { CiCirclePlus } from 'react-icons/ci';
import { FaCaretDown, FaRegBuilding } from 'react-icons/fa6';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { LuWrench } from 'react-icons/lu';
import { Button, Dropdown, Space, Table, Tag, type MenuProps, type TableProps } from 'antd';
import { roomsFormFields } from '../constants/rooms-form-fields';
import FormModal from '@/app/layout/components/admin/FormModal';

const defaultRoomData: RoomFormData = {
    branch_id: "",
    room_type_id: "",
    room_number: "",
    floor: 0,
    is_active: true,
    basic: [],
    extra: [],
    status: "available"
};

const rooms = () => {

  const room = useFormModal<Room>();
  const [roomsData, setRoomsData] = React.useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await roomsApi.getAllRooms();
        setRoomsData(data);
      } catch (error) {
        console.error("Error fetching rooms:", error);
        message.error("Lỗi khi tải danh sách phòng");
      }
    };
    fetchRooms();
  }, [roomsData]);


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
          room.close();
        } catch (error) {
          message.error("Cập nhật phòng thất bại");
          console.error("Update error:", error);
        }
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
      dataIndex: "room_type_id",
      key: "room_type_id",
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch_id",
      key: "branch_id",
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (text, record: Room) => {
        // Tạo items động với onClick cho từng branch
        const dynamicStatusItems: MenuProps["items"] = [
          { key: "Available", label: <span className="text-green-600">Available</span>, onClick: () => handleStatusChange(record.id, { status: "available" }) },
          { key: "Unavailable", label: <span className="text-red-600">Unavailable</span>, onClick: () => handleStatusChange(record.id, { status: "unavailable" }) },
          { key: "Occupied", label: <span className="text-yellow-600">Occupied</span>, onClick: () => handleStatusChange(record.id, { status: "occupied" }) },
          { key: "Cleaning", label: <span className="text-blue-600">Cleaning</span>, onClick: () => handleStatusChange(record.id, { status: "cleaning" }) },
        ];

        return (
          <Dropdown
            menu={{ items: dynamicStatusItems }}
            trigger={["click"]} //Click để hiển thị
            placement="bottomLeft"
          >
            <Tag color={text?.toLowerCase() === "occupied" ? "yellow" : text?.toLowerCase() === "available" ? "green" : text?.toLowerCase() === "unavailable" ? "red" : "blue"} style={{ cursor: "pointer" }}>
              {text}
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
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => room.openEdit(record)}>
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
            onClick={() => room.openCreate()}
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
            <div className="text-2xl font-bold ">{roomsData.length}</div>
          </div>
  
          <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-between">
              <span className="font-xl font-bold text-green-500">
                Đang hoạt động
              </span>
              <IoIosCheckmarkCircleOutline className="text-green-500 text-2xl" />
            </div>
            <div className="text-2xl font-bold ">
              {roomsData.filter((item: Room) => item.is_active).length}
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
              {roomsData.filter((item: Room) => !item.is_active).length}
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
                {roomsData.length}
              </p>
            </div>
          </div>
          <Table<Room>
            columns={columns}
            dataSource={roomsData}
            loading={loading}
            pagination={{ pageSize: 5 }}
          />
        </div>
  
          <FormModal
          isOpen={room.open}
          onClose={room.close}
          mode={room.mode}
          title={room.mode === FormModalModes.CREATE ? "Thêm phòng mới" : "Chỉnh sửa phòng"}
          fields={roomsFormFields}
          initialValues={room.selectedRecord || defaultRoomData}
          onSubmit={handleSubmitForm}
          />
      </div>
    );
}

export default rooms