import { Button, Dropdown, message, Space, Table, Tag, type MenuProps, type TableProps } from 'antd';
import type { Booking, BookingFormData } from '../types/booking-type';
import { useFormModal } from '@/shared/hooks/useFormModal';
import { useCallback, useEffect, useState } from 'react';
import { bookingApi } from '../api/booking-api';
import { FaRegBuilding } from 'react-icons/fa';
import { IoIosCheckmarkCircleOutline } from 'react-icons/io';
import { LuWrench } from 'react-icons/lu';
import FormModal from '@/app/layout/components/admin/FormModal';
import { FormModalModes } from '@/shared/types/type-form-mode';
import { CiCirclePlus } from 'react-icons/ci';
import { bookingFormFields } from '../constants/booking-form-fields';

const defaultBookingData: BookingFormData = {
    branch_id: "",
    customer_id: "",
    room_type_id: "",
    booking_type: "",
    status: "",
    checkin_at: "",
    checkout_at: "",
    num_guests: 1,
    created_by: "",
    notes: ""
};

const StaffBooking = () => {
    const booking = useFormModal<Booking>();
    const [bookingsData, setBookingsData] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const data = await bookingApi.getAllBooking();
            setBookingsData(data);
            setFilteredBookings(data);
        } catch (error) {
            console.error("Error fetching bookings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleStatusChange = async (id: string, updatedData: any) => {
        setLoading(true);
        try {
            await bookingApi.updateBooking(id, updatedData);
            setBookingsData((prevData) =>
                prevData.map((booking) =>
                    booking.id === id ? { ...booking, ...updatedData } : booking
                )
            );
        } catch (error) {
            console.error("Error updating booking status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitForm = async (values: BookingFormData) => {
      if (booking.mode === FormModalModes.CREATE) {
        try {
          await bookingApi.createBooking(values);
          message.success("Đặt phòng thành công!");
          fetchBookings();
          booking.close();
        } catch (error) {
          console.error("Error creating booking:", error);
          message.error("Có lỗi xảy ra khi tạo đặt phòng.");
        }
      } else if (booking.mode === FormModalModes.UPDATE && booking.selectedRecord) {
        try {
          await bookingApi.updateBooking(booking.selectedRecord.id, values);
          message.success("Cập nhật đặt phòng thành công!");
          fetchBookings();
          booking.close();
        } catch (error) {
          console.error("Error updating booking:", error);
          message.error("Có lỗi xảy ra khi cập nhật đặt phòng.");
        }
      }
    };

    const columns: TableProps<Booking>["columns"] = [
    {
      title: "Mã đặt phòng",
      dataIndex: "booking_code",
      key: "booking_code",
      render: (text) => <a>{text}</a>,
    //   sorter: (a, b) => a.booking_code.localeCompare(b.booking_code),
    //   defaultSortOrder: "ascend",
    },
    {
      title: "Tên khách hàng",
      key: "customer_id",
      render: (_, record) => <p>{record.customer_id}</p>,
    },
    {
      title: "Loại phòng",
      key: "room_type_id",
      render: (_, record) => <p>{record.room_type_id}</p>,
    },
    {
      title: "Ngày nhận phòng",
      key: "checkin_at",
      render: (_, record) => <p>{record.checkin_at}</p>,
    },
    {
      title: "Ngày trả phòng",
      key: "checkout_at",
      render: (_, record) => <p>{record.checkout_at}</p>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (text, record: Booking) => {
        // Tạo items động với onClick cho từng branch
        const dynamicStatusItems: MenuProps["items"] = [
          {
            key: "Pending",
            label: <span className="text-green-600">Đang chờ</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "pending" }),
          },
          {
            key: "Confirmed",
            label: <span className="text-red-600">Đã xác nhận</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "confirmed" }),
          },
          {
            key: "Completed",
            label: <span className="text-yellow-600">Hoàn thành</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "completed" }),
          },
          {
            key: "Cancelled",
            label: <span className="text-blue-600">Đã hủy</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "cancelled" }),
          },
          {
            key: "Checked-in",
            label: <span className="text-blue-600">Đã nhận phòng</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "checked-in" }),
          },
          {
            key: "Checked-out",
            label: <span className="text-blue-600">Đã trả phòng</span>,
            onClick: () =>
              handleStatusChange(record.id, { status: "checked-out" }),
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
                text?.toLowerCase() === "pending"
                  ? "amber"
                  : text?.toLowerCase() === "confirmed"
                    ? "blue"
                    : text?.toLowerCase() === "completed"
                      ? "green"
                      : text?.toLowerCase() === "cancelled"
                        ? "red"
                        : text?.toLowerCase() === "checked-in"
                            ? "cyan"
                            : text?.toLowerCase() === "checked-out"
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
                      : text === "checked-in"
                        ? "Đã nhận phòng"
                        : text === "checked-out"
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
        <Space size="medium">
          <Button onClick={() => booking.openView(record)} type="dashed">
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
          <p className="text-3xl font-bold">Quản lý đặt phòng</p>
          <p className="text-gray-600">
            Danh sách đặt phòng trong hệ thống khách sạn Aurora
          </p>
        </div>
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => booking.openCreate()}
        >
          <CiCirclePlus /> Thêm đơn đặt phòng mới
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">
              Tổng đặt phòng
            </span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {Array.isArray(bookingsData) ? bookingsData.length : 0}
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
            {Array.isArray(bookingsData)
              ? bookingsData.filter((item: Booking) => item.status === "active")
                  .length
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
            {Array.isArray(bookingsData)
              ? bookingsData.filter(
                  (item: Booking) => item.status === "inactive",
                ).length
              : 0}
          </div>
        </div>
      </div>

      <div className="mt-5 border border-gray-300 rounded-lg">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
          {/* <div className="flex items-center gap-4">
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
          </div> */}
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
          pagination={{ pageSize: 5 }}
        />
      </div>

      <FormModal
        isOpen={booking.open}
        onClose={booking.close}
        mode={booking.mode}
        title={booking.mode === FormModalModes.VIEW ? "Chi tiết đặt phòng" : ""}
        fields={bookingFormFields}
        initialValues={booking.selectedRecord || defaultBookingData}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}

export default StaffBooking