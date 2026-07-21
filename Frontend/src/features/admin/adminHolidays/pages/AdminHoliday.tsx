import { useFormModal } from "@/shared/hooks/useFormModal"
import type { Holiday, HolidayFormData } from "../types/holiday-types"
import { useCallback, useEffect, useState } from "react";
import { holidaysApi } from "../api/holidays-api";
import message from "antd/es/message";
import { Button, Space, Table, type TableProps } from "antd";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa6";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import FormModal from "@/app/layout/components/admin/FormModal";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { holidayFormFields } from "../contants/holiday-form-fields";

const defaultHolidayTypeData: HolidayFormData = {
    branch_id: "",
    date: "",
    name: "",
}

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
}

const AdminHoliday = () => {
    const holiday = useFormModal<Holiday>();
    const [holidaysData, setHolidaysData] = useState<Holiday[]>([]);
    const [filteredHolidayData, setFilteredHolidayData] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchHolidayData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await holidaysApi.getAll();
            setHolidaysData(Array.isArray(data) ? data : []);
            setFilteredHolidayData(Array.isArray(data) ? data : []);
        }
        catch (error) {
            console.error("Error fetching holiday data:", error);
            message.error("Đã xảy ra lỗi khi tải dữ liệu ngày lễ. Vui lòng thử lại sau.");
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHolidayData();
    }, [fetchHolidayData]);

    const handleSubmitForm = async (formData: HolidayFormData) => {
        if (holiday.mode === FormModalModes.CREATE) {
            try {
                await holidaysApi.create(formData);
                message.success("Thêm ngày lễ thành công!");
                fetchHolidayData();
                holiday.close();
            } catch (error) {
                console.error("Error creating holiday:", error);
                message.error("Đã xảy ra lỗi khi thêm ngày lễ. Vui lòng thử lại sau.");
            }
        } else if (holiday.mode === FormModalModes.UPDATE && holiday.selectedRecord) {
            try {
                await holidaysApi.update(holiday.selectedRecord.id, formData);
                message.success("Cập nhật ngày lễ thành công!");
                fetchHolidayData();
                holiday.close();
            } catch (error) {
                console.error("Error updating holiday:", error);
                message.error("Đã xảy ra lỗi khi cập nhật ngày lễ. Vui lòng thử lại sau.");
            }
    };
}


    const columns: TableProps<Holiday>["columns"] = [
    {
      title: "Tên ngày lễ",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Chi nhánh",
      key: "branch_id",
      render: (_, record) => <p>{record.branch_id}</p>,
    },
    {
      title: "Ngày lễ",
      render: (_, record) => <p>{formatDate(record.date)}</p>,
      key: "date",
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => holiday.openEdit(record)} type="primary">
            Chỉnh sửa
          </Button>
          <Button onClick={() => holiday.openView(record)} type="dashed">
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
            <p className="text-3xl font-bold">Quản lý ngày lễ</p>
            <p className="text-gray-600">
              Danh sách các ngày lễ trong hệ thống khách sạn Aurora
            </p>
          </div>
          <div
            className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
            onClick={() => holiday.openCreate()}
          >
            <CiCirclePlus /> Thêm ngày lễ mới
          </div>
        </div>
  
        <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
          <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-between">
              <span className="font-xl font-bold text-blue-500">
                Tổng ngày lễ
              </span>
              <FaRegBuilding className="text-blue-500 text-2xl" />
            </div>
            <div className="text-2xl font-bold ">
              {Array.isArray(holidaysData) ? holidaysData.length : 0}
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
              {/* {Array.isArray(holidaysData) ? holidaysData.filter((item: Holiday) => item.is_active).length : 0} */}
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
              {/* {Array.isArray(holidaysData) ? holidaysData.filter((item: Holiday) => !item.is_active).length : 0} */}
            </div>
          </div>
        </div>
  
        <div className="mt-5 border border-gray-300 rounded-lg">
          <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
            <div className="flex items-center gap-4">

            {/* <Input placeholder="Tìm kiếm..." prefix={<IoSearch className="text-xl" />} onChange={(e) => handleSearch(e.target.value)} /> */}
            </div>
            <div className="flex items-center gap-3 pr-4">
              <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
              <p className="font-lg font-bold text-green-700 rounded-lg">
                {Array.isArray(filteredHolidayData) ? filteredHolidayData.length : 0}
              </p>
            </div>
          </div>
          <Table<Holiday>
            columns={columns}
            pagination={{ pageSize: 5 }}
            dataSource={filteredHolidayData}
            loading={loading}
          />
        </div>
          <FormModal
          isOpen={holiday.open}
          onClose={holiday.close}
          mode={holiday.mode}
          title={holiday.mode === FormModalModes.CREATE ? "Thêm ngày lễ mới" : holiday.mode === FormModalModes.UPDATE ? "Chỉnh sửa ngày lễ" : "Chi tiết ngày lễ"}
          fields={holidayFormFields}
          initialValues={holiday.selectedRecord || defaultHolidayTypeData}
          onSubmit={handleSubmitForm}
          />
      </div>
    );
}

export default AdminHoliday