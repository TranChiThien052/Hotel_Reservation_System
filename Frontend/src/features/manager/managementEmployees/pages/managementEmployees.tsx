import FormModal from "@/app/layout/components/admin/FormModal";
import { useAppSelector } from "@/app/store/hooks";
import { employeesApi } from "@/features/admin/adminEmployees/api/employees-api";
import { emplloyeesFormFields } from "@/features/admin/adminEmployees/constants/employees-form-field";
import type { Employee, EmployeeFormData } from "@/features/admin/adminEmployees/types/employees-type";
import { useFormModal } from "@/shared/hooks/useFormModal";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { Button, Input, message, Space, Table, type TableProps } from "antd";
import { useCallback, useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegCheckCircle } from "react-icons/fa";
import { FaRegBuilding } from "react-icons/fa6";
import { IoSearch } from "react-icons/io5";
import { LuWrench } from "react-icons/lu";


const defaultEmployeeData: EmployeeFormData = {
  branch_id: "",
  full_name: "",
  phone: "",
  position: "",
  account_id: "",
};

const managementEmployees = () => {
  const employee = useFormModal<Employee>();
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const user = useAppSelector((state) => state.auth.user);


  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
        const data = await employeesApi.getEmployeesByBranchId(user?.branch_id || "");
        setEmployeesData(data);
        setFilteredEmployees(data);
    } catch (error) {
        console.error("Error fetching employees:", error);
        message.error("Đã xảy ra lỗi khi tải danh sách nhân viên. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleSubmitForm = async (values: EmployeeFormData) => {
    if (employee.mode === FormModalModes.CREATE) {
      try {
        await employeesApi.createEmployee(values);
        fetchEmployees();
        employee.close();
      } catch (error) {
        console.error("Error creating employee:", error);
        message.error("Đã xảy ra lỗi khi tạo nhân viên. Vui lòng thử lại.");
      }
    } else if (employee.mode === FormModalModes.UPDATE && employee.selectedRecord) {
      try {
        await employeesApi.updateEmployee(employee.selectedRecord.id, values);
        fetchEmployees();
        employee.close();
      } catch (error) {
        console.error("Error updating employee:", error);
        message.error("Đã xảy ra lỗi khi cập nhật nhân viên. Vui lòng thử lại.");
      }
    }
  }

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm) {
      setFilteredEmployees(employeesData);
        return;
    } else {
        const filtered = employeesData.filter(
            (employee) =>
                employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                employee.phone.includes(searchTerm) ||
                employee.position.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredEmployees(filtered);
    }
    };

  const columns: TableProps<Employee>["columns"] = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Chi nhánh",
      dataIndex: "branch_id",
      key: "branch_id",
    },
    {
      title: "Số điện thoại",
      key: "phone",
      render: (_, record) => <p>{record.phone}</p>,
    },
    {
      title: "Vị trí",
      dataIndex: "position",
      key: "position",
      render: (text) => <p>{text === "manager" ? "Quản lý" : text === "staff" ? "Nhân viên" : text}</p>,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => employee.openEdit(record)} type="primary">
            Chỉnh sửa
          </Button>
          <Button onClick={() => employee.openView(record)} type="dashed">
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
          <p className="text-3xl font-bold">Quản lý nhân viên</p>
          <p className="text-gray-600">
            Danh sách các nhân viên trong hệ thống khách sạn Aurora
          </p>
        </div>
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => employee.openCreate()}
        >
          <CiCirclePlus /> Thêm nhân viên mới
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">
              Tổng nhân viên
            </span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {Array.isArray(employeesData) ? employeesData.length : 0}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-green-500">
              Đang hoạt động
            </span>
            <FaRegCheckCircle className="text-green-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {/* {Array.isArray(customersData)
              ? customersData.filter((item: Customer) => item.is_active).length
              : 0} */}
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
            {/* {Array.isArray(customersData)
              ? customersData.filter((item: Customer) => !item.is_active).length
              : 0} */}
          </div>
        </div>
      </div>

      <div className="mt-5 border border-gray-300 rounded-lg">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Tìm kiếm..."
              prefix={<IoSearch className="text-xl" />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pr-4">
            <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
            <p className="font-lg font-bold text-green-700 rounded-lg">
              {Array.isArray(filteredEmployees) ? filteredEmployees.length : 0}
            </p>
          </div>
        </div>
        <Table<Employee>
          columns={columns}
          dataSource={filteredEmployees}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>

      <FormModal
        isOpen={employee.open}
        onClose={employee.close}
        mode={employee.mode}
        title={
          employee.mode === FormModalModes.CREATE
            ? "Thêm nhân viên mới"
            : employee.mode === FormModalModes.UPDATE
            ? "Chỉnh sửa nhân viên"
            : "Chi tiết nhân viên"
        }
        fields={emplloyeesFormFields}
        initialValues={employee.selectedRecord || defaultEmployeeData}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
}

export default managementEmployees