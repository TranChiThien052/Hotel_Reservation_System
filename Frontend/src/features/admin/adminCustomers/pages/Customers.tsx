import FormModal from "@/app/layout/components/admin/FormModal";
import { Button, Input, message, Space, Table, type TableProps } from "antd";
import { useCallback, useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegBuilding, FaRegCheckCircle } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import { LuWrench } from "react-icons/lu";
import type { Customer, CustomerFormData } from "../types/customers-type";
import { useFormModal } from "@/shared/hooks/useFormModal";
import { customersApi } from "../api/customers-api";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { customersFormFields } from "../constants/customers-form-fields";

const defaultCustomerData: CustomerFormData = {
  account_id: "",
  full_name: "",
  phone: "",
  email: "",
  id_card_number: "",
  date_of_birth: "",
  nationality: "",
  address: "",
};

const Customers = () => {
  const customer = useFormModal<Customer>();
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customersApi.getAllCustomers();
      setCustomersData(data);
      setFilteredCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      message.error("Đã xảy ra lỗi khi tải danh sách khách hàng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSubmitForm = async (values: CustomerFormData) => {
    if (customer.mode === FormModalModes.CREATE) {
      try {
        await customersApi.createCustomer(values);
        fetchCustomers();
        customer.close();
      } catch (error) {
        console.error("Error creating customer:", error);
        message.error("Đã xảy ra lỗi khi tạo khách hàng. Vui lòng thử lại.");
      }
    } else if (
      customer.mode === FormModalModes.UPDATE &&
      customer.selectedRecord
    ) {
      try {
        await customersApi.updateCustomer(customer.selectedRecord.id, values);
        fetchCustomers();
        customer.close();
      } catch (error) {
        console.error("Error updating customer:", error);
        message.error(
          "Đã xảy ra lỗi khi cập nhật khách hàng. Vui lòng thử lại.",
        );
      }
    }
  };

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm) {
      setFilteredCustomers(customersData);
      return;
    } else {
      const filtered = customersData.filter(
        (customer) =>
          customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.id_card_number.includes(searchTerm) ||
          customer.nationality.includes(searchTerm),
      );
      setFilteredCustomers(filtered);
    }
  };

  const columns: TableProps<Customer>["columns"] = [
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      key: "full_name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Số điện thoại",
      key: "phone",
      render: (_, record) => <p>{record.phone}</p>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "CCCD/CMND hoặc Passport",
      key: "id_card_number",
      render: (_, record) => <p>{record.id_card_number}</p>,
    },
    {
      title: "Quốc tịch",
      key: "nationality",
      render: (_, record) => <p>{record.nationality}</p>,
    },
    {
      title: "Ngày sinh",
      key: "date_of_birth",
      dataIndex: "date_of_birth",
      render: (text) => (
        <span>{text ? new Date(text).toLocaleDateString() : "-"}</span>
      )
    },
    {
      title: "Địa chỉ",
      key: "address",
      render: (_, record) => <p>{record.address}</p>,
    },
    {
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => customer.openEdit(record)} type="primary">
            Chỉnh sửa
          </Button>
          <Button onClick={() => customer.openView(record)} type="dashed">
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
          <p className="text-3xl font-bold">Quản lý khách hàng</p>
          <p className="text-gray-600">
            Danh sách các khách hàng trong hệ thống khách sạn Aurora
          </p>
        </div>
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => customer.openCreate()}
        >
          <CiCirclePlus /> Thêm khách hàng mới
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">
              Tổng khách hàng
            </span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {Array.isArray(customersData) ? customersData.length : 0}
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
              {Array.isArray(filteredCustomers) ? filteredCustomers.length : 0}
            </p>
          </div>
        </div>
        <Table<Customer>
          columns={columns}
          dataSource={filteredCustomers}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>

      <FormModal
        isOpen={customer.open}
        onClose={customer.close}
        mode={customer.mode}
        title={
          customer.mode === FormModalModes.CREATE
            ? "Thêm khách hàng mới"
            : customer.mode === FormModalModes.UPDATE
            ? "Chỉnh sửa khách hàng"
            : "Chi tiết khách hàng"
        }
        fields={customersFormFields}
        initialValues={customer.selectedRecord || defaultCustomerData}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default Customers;
