import {
  Button,
  Dropdown,
  Input,
  message,
  Select,
  Space,
  Table,
  Tag,
  type MenuProps,
  type TableProps,
} from "antd";
import type { Booking } from "../types/booking-type";
import { useCallback, useEffect, useState } from "react";
import { bookingApi } from "../api/booking-api";
import { FaRegBuilding } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import { CiCirclePlus } from "react-icons/ci";
import { useAppSelector } from "@/app/store/hooks";
import { IoReload, IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import StaffBookingModal from "../components/StaffBookingModal";

const StaffBooking = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const bookingDetailPath =
    user?.role === "manager" ? "/manager/bookings" : "/staff/bookings";
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingApi.getBookingsByBranchId(
        user?.branch_id || "",
      );
      setBookingsData(data);
      setFilteredBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.branch_id]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);


  const handleStatusChange = async (id: string, updatedData: any) => {
    setLoading(true);
    try {
      await bookingApi.updateBooking(id, updatedData);
      setBookingsData((prevData) =>
        prevData.map((booking) =>
          booking.id === id ? { ...booking, ...updatedData } : booking,
        ),
      );
    } catch (error) {
      console.error("Error updating booking status:", error);
    } finally {
      fetchBookings();
      setLoading(false);
    }
  };

  const filterRoomStatus = (value: string) => {
    if (!value) {
      setFilteredBookings(bookingsData);
      return;
    }
    setFilteredBookings(bookingsData.filter((b) => b.status === value));
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm) {
      setFilteredBookings(bookingsData);
      return;
    }
    setFilteredBookings(
      bookingsData.filter((b) =>
        b.booking_code.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  };

  const handleFilterTodayBookings = () => {
    const today = new Date();
    const filtered = bookingsData.filter((booking) => {
      const checkinDate = new Date(booking.checkin_at);
      return (
        checkinDate.getFullYear() === today.getFullYear() &&
        checkinDate.getMonth() === today.getMonth() &&
        checkinDate.getDate() === today.getDate()
      );
    });
    setFilteredBookings(filtered);
  };


  const columns: TableProps<Booking>["columns"] = [
    {
      title: "Mã đặt phòng",
      dataIndex: "booking_code",
      key: "booking_code",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Tên khách hàng",
      key: "customer_id",
      render: (_, record) => <p>{record.customers?.full_name}</p>,
    },
    {
      title: "Loại phòng",
      key: "room_type_id",
      render: (_, record) => <p>{record.room_types?.name}</p>,
    },
    {
      title: "Ngày nhận phòng",
      key: "checkin_at",
      render: (_, record) => (
        <p>
          {record.checkin_at
            ? new Date(record.checkin_at).toLocaleDateString("vi-VN")
            : "-"}
        </p>
      ),
      sorter: (a, b) => {
        const dateA = a.checkin_at ? new Date(a.checkin_at).getTime() : 0;
        const dateB = b.checkin_at ? new Date(b.checkin_at).getTime() : 0;
        return dateA - dateB;
      },
      defaultSortOrder: "descend",
    },
    {
      title: "Ngày trả phòng",
      key: "checkout_at",
      render: (_, record) => (
        <p>
          {record.checkout_at
            ? new Date(record.checkout_at).toLocaleDateString("vi-VN")
            : "-"}
        </p>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text, record: Booking) => {
        const dynamicStatusItems: MenuProps["items"] = [
          {
            key: "Pending",
            label: <span className="text-amber-600">Đang chờ</span>,
            onClick: () => handleStatusChange(record.id, { status: "pending" }),
          },
          {
            key: "Confirmed",
            label: <span className="text-blue-600">Đã xác nhận</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "confirmed" }),
          },
          {
            key: "Completed",
            label: <span className="text-green-600">Hoàn thành</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "completed" }),
          },
          {
            key: "Cancelled",
            label: <span className="text-red-600">Đã hủy</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "cancelled" }),
          },
          {
            key: "Checked-in",
            label: <span className="text-cyan-600">Đã nhận phòng</span>,
            onClick: () =>
              handleStatusChange(record.id, {
                status: "checked_in",
                actual_checkin_at: new Date().toISOString(),
              }),
          },
          {
            key: "Checked-out",
            label: <span className="text-purple-600">Đã trả phòng</span>,
            onClick: () =>
              handleStatusChange(record.id, {
                status: "checked_out",
                actual_checkout_at: new Date().toISOString(),
              }),
          },
        ];
        return (
          <Dropdown
            menu={{ items: dynamicStatusItems }}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <Tag
              color={
                text?.toLowerCase() === "pending"
                  ? "amber"
                  : text?.toLowerCase() === "confirmed"
                    ? "blue"
                    : text?.toLowerCase() === "completed"
                      ? "green"
                      : text?.toLowerCase() === "cancelled"
                        ? "red"
                        : text?.toLowerCase() === "checked_in"
                          ? "cyan"
                          : text?.toLowerCase() === "checked_out"
                            ? "purple"
                            : "default"
              }
              style={{ cursor: "pointer" }}
            >
              {text === "pending"
                ? "Đang chờ"
                : text === "confirmed"
                  ? "Đã xác nhận"
                  : text === "completed"
                    ? "Hoàn thành"
                    : text === "cancelled"
                      ? "Đã hủy"
                      : text === "checked_in"
                        ? "Đã nhận phòng"
                        : text === "checked_out"
                          ? "Đã trả phòng"
                          : "Đang dọn dẹp"}
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
        <Space size="small" wrap>
          <Button
            onClick={() => navigate(`${bookingDetailPath}/${record.id}`)}
            type="primary"
            size="small"
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-7 flex flex-col gap-5">
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-col gap-1">
          <p className="text-3xl font-bold">Quản lý đặt phòng</p>
          <p className="text-gray-600">
            Danh sách đặt phòng trong hệ thống khách sạn Aurora
          </p>
        </div>
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => setModalOpen(true)}
        >
          <CiCirclePlus /> Thêm đơn đặt phòng mới
        </div>
      </div>
      <div className="flex ml-auto items-center">
        <Button
          onClick={() => {
            setFilteredBookings(bookingsData);
          }}
          type="default"
        >
          <IoReload />
          Tất cả đơn
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">
              Tổng đặt phòng
            </span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold">
            {Array.isArray(bookingsData) ? bookingsData.length : 0}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-green-500">
              Đã xác nhận
            </span>
            <IoIosCheckmarkCircleOutline className="text-green-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold">
            {Array.isArray(bookingsData)
              ? bookingsData.filter(
                  (item: Booking) => item.status === "confirmed",
                ).length
              : 0}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-yellow-500">Đang chờ</span>
            <LuWrench className="text-yellow-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold">
            {Array.isArray(bookingsData)
              ? bookingsData.filter(
                  (item: Booking) => item.status === "pending",
                ).length
              : 0}
          </div>
        </div>
      </div>

      <div className="mt-5 border border-gray-300 rounded-lg">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm mã đặt phòng..."
              prefix={<IoSearch className="text-xl" />}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <Select
              placeholder="Lọc theo trạng thái"
              placement="topRight"
              style={{ width: 170 }}
              onChange={filterRoomStatus}
              allowClear
              options={[
                {
                  value: "pending",
                  label: <span className="text-amber-600">Đang chờ</span>,
                },
                {
                  value: "confirmed",
                  label: <span className="text-blue-600">Đã xác nhận</span>,
                },
                {
                  value: "cancelled",
                  label: <span className="text-red-600">Đã hủy</span>,
                },
                {
                  value: "completed",
                  label: <span className="text-green-600">Đã hoàn thành</span>,
                },
                {
                  value: "checked_in",
                  label: <span className="text-cyan-600">Đã nhận phòng</span>,
                },
                {
                  value: "checked_out",
                  label: <span className="text-purple-600">Đã trả phòng</span>,
                },
              ]}
            />
            <Button
              onClick={handleFilterTodayBookings}
              type="primary"
            >
              Đơn hôm nay
            </Button>
          </div>
          <div className="flex items-center gap-3 pr-4">
            <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
            <p className="font-lg font-bold text-green-700 rounded-lg">
              {Array.isArray(filteredBookings) ? filteredBookings.length : 0}
            </p>
          </div>
        </div>
        <Table<Booking>
          columns={columns}
          dataSource={filteredBookings}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </div>

      <StaffBookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchBookings();
          message.success("Đặt phòng thành công!");
        }}
        branchId={user?.branch_id ?? ""}
      />
    </div>
  );
};

export default StaffBooking;
