import { useFormModal } from "@/shared/hooks/useFormModal";
import type { Service, ServiceFormData } from "../types/services-type";
import { useEffect, useState } from "react";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import Table from "antd/es/table/Table";
import FormModal from "@/app/layout/components/admin/FormModal";
import { servicesApi } from "../api/services-api";
import {
  Button,
  Dropdown,
  message,
  Space,
  Tag,
  type MenuProps,
  type TableProps,
} from "antd";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { servicesFormFields } from "../constants/services-form-fields";

const defaultServiceData: ServiceFormData = {
  name: "",
  description: "",
  price: 0,
  branch_id: "",
  is_active: true,
  unit: "",
};
const Services = () => {
  const services = useFormModal<Service>();
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await servicesApi.getAllServices();
        setServicesData(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [servicesData]);

  const handleStatusChange = async (
    id: string,
    updatedFields: Partial<ServiceFormData>,
  ) => {
    try {
      await servicesApi.updateService(id, updatedFields as ServiceFormData);
      message.success("Cập nhật trạng thái dịch vụ thành công!");
    } catch (error) {
      message.error(
        "Có lỗi xảy ra khi cập nhật trạng thái dịch vụ. Vui lòng thử lại.",
      );
    }
  };

  const handleSubmitForm = async (values: ServiceFormData) => {
    if (services.mode === FormModalModes.CREATE) {
      try {
        await servicesApi.createService(values);
        message.success("Thêm dịch vụ thành công!");
        services.close();
      } catch (error) {
        message.error("Có lỗi xảy ra khi thêm dịch vụ. Vui lòng thử lại.");
      }
    } else if (
      services.mode === FormModalModes.UPDATE &&
      services.selectedRecord
    ) {
      try {
        await servicesApi.updateService(services.selectedRecord.id, values);
        message.success("Cập nhật dịch vụ thành công!");
        services.close();
      } catch (error) {
        message.error("Có lỗi xảy ra khi cập nhật dịch vụ. Vui lòng thử lại.");
      }
    }
  };

  const columns: TableProps<Service>["columns"] = [
    {
      title: "Tên dịch vụ",
      key: "name",
      dataIndex: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "price",
      render: (text) => <span>{text?.toLocaleString()} VND</span>,
    },
    {
      title: "Đơn vị tính",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      render: (text, record: Service) => {
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
          <Button onClick={() => services.openEdit(record)}>Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-7 flex flex-col gap-5 ">
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-col gap-1">
          <p className="text-3xl font-bold">Quản lý dịch vụ</p>
          <p className="text-gray-600">
            Danh sách các dịch vụ trong hệ thống khách sạn Aurora
          </p>
        </div>
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => services.openCreate()}
        >
          <CiCirclePlus /> Thêm dịch vụ mới
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">
              Tổng dịch vụ
            </span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">{servicesData.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-green-500">
              Dịch vụ được cung cấp
            </span>
            <IoIosCheckmarkCircleOutline className="text-green-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {servicesData.filter((item: Service) => item.is_active).length}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-yellow-500">
              Dịch vụ dừng cung cấp
            </span>
            <LuWrench className="text-yellow-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold">
            {servicesData.filter((item: Service) => !item.is_active).length}
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
              {servicesData.length}
            </p>
          </div>
        </div>
        <Table<Service>
          columns={columns}
          dataSource={servicesData}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>

      <FormModal
        isOpen={services.open}
        onClose={services.close}
        mode={services.mode}
        title={
          services.mode === FormModalModes.CREATE
            ? "Thêm dịch vụ mới"
            : "Chỉnh sửa dịch vụ"
        }
        fields={servicesFormFields}
        initialValues={services.selectedRecord || defaultServiceData}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default Services;
