import { CiCirclePlus } from "react-icons/ci";
import { FaCaretDown, FaRegBuilding } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import { Button, Dropdown, message, Space, Table, Tag } from "antd";
import type { MenuProps, TableProps } from "antd";
import type { Branch, BranchFormData } from "../types/branch-type";
import { useCallback, useEffect, useState } from "react";

import {
  FormModalModes,
  type FormModalMode,
} from "@/shared/types/type-form-mode";
import { branchEditFormFields } from "../constants/branch-edit-form-fields";
import FormModal from "@/app/layout/components/admin/FormModal";
import { branchApi } from "../api/admin-api";

const defaultBranchData: BranchFormData = {
  name: "",
  city: "",
  address: "",
  phone: "",
  email: "",
  description: "",
  is_active: false,
};

const Branches = () => {
  const [loading, setLoading] = useState(false);
  const [branchesData, setBranchesData] = useState<Branch[]>([]);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedBranch, setSelectedBranch] =
    useState<BranchFormData>(defaultBranchData);
  const [modalMode, setModalMode] = useState<FormModalMode>(
    FormModalModes.CREATE,
  );
  const [editingId, setEditingId] = useState<string>("");
  // const navigate = useNavigate();

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await branchApi.getBranches();
      setBranchesData(Array.isArray(data) ? data : []);
    } catch (error) {
      message.error("Lấy danh sách chi nhánh thất bại");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const closeModal = () => {
    setIsOpenModal(false);
    setSelectedBranch(defaultBranchData);
  };

  const status: MenuProps["items"] = [
    {
      key: "active",
      label: "Active",
      onClick: () => {},
    },
    {
      key: "inactive",
      label: "Inactive",
      onClick: () => {},
    },
  ];

  const handleStatusChange = async (branchId: string, branchData: any) => {
    setLoading(true);
    try {
      console.log("Updating branch:", branchId, "Data:", branchData);
      await branchApi.updateBranch(branchId, branchData);
      setBranchesData((prevData) =>
        prevData.map((item) =>
          item.id === branchId
            ? { ...item, is_active: branchData.is_active }
            : item,
        ),
      );
      message.success("Cập nhật trạng thái chi nhánh thành công");
      await fetchBranches(); // Gọi lại fetchBranches để cập nhật danh sách chi nhánh
    } catch (error) {
      message.error("Cập nhật trạng thái chi nhánh thất bại");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: FormModalMode, branch?: Branch) => {
    setModalMode(mode);
    if (branch && mode === FormModalModes.UPDATE) {
      setEditingId(branch.id);
      setSelectedBranch({
        name: branch.name,
        city: branch.city,
        address: branch.address,
        phone: branch.phone,
        email: branch.email,
        description: branch.description,
        is_active: branch.is_active,
      });
    } else {
      setSelectedBranch(defaultBranchData);
      setEditingId("");
    }
    setIsOpenModal(true);
  };
  const handleSubmitForm = async (formData: BranchFormData) => {
    if (modalMode === FormModalModes.CREATE) {
      console.log("Creating new branch with data:", formData);
      // Xử lý tạo mới chi nhánh
      try {
        await branchApi.createBranch(formData);
        message.success("Tạo chi nhánh thành công");
        await fetchBranches(); // Gọi lại fetchBranches để cập nhật danh sách chi nhánh
      } catch (error) {
        message.error("Tạo chi nhánh thất bại");
        console.error("Create error:", error);
      }
    } else if (modalMode === FormModalModes.UPDATE && selectedBranch) {
      console.log("Updating branch with ID:", editingId, "Data:", formData);
      // Xử lý cập nhật chi nhánh
      try {
        await branchApi.updateBranch(editingId, formData);
        message.success("Cập nhật chi nhánh thành công");
        await fetchBranches(); // Gọi lại fetchBranches để cập nhật danh sách chi nhánh
      } catch (error) {
        message.error("Cập nhật chi nhánh thất bại");
        console.error("Update error:", error);
      }
    }
    closeModal();
  };

  const columns: TableProps<Branch>["columns"] = [
    {
      title: "Tên chi nhánh",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <a className="text-blue-500 text-lg font-bold hover:underline">
          {text}
        </a>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "Thành phố",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      key: "is_active",
      dataIndex: "is_active",
      render: (text, record: Branch) => {
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
      title: "Hành động",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button
            onClick={() => {
              handleOpenModal(FormModalModes.UPDATE, record);
            }}
          >
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
          <p className="text-3xl font-bold">Quản lý chi nhánh</p>
          <p className="text-gray-600">
            Danh sách các cơ sở lưu trú trong hệ thống khách sạn Aurora
          </p>
        </div>
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => handleOpenModal(FormModalModes.CREATE)}
        >
          <CiCirclePlus /> Thêm chi nhánh mới
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">
              Tổng chi nhánh
            </span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {Array.isArray(branchesData) ? branchesData.length : 0}
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
            {Array.isArray(branchesData)
              ? branchesData.filter((item: Branch) => item.is_active).length
              : 0}
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
            {Array.isArray(branchesData)
              ? branchesData.filter((item: Branch) => !item.is_active).length
              : 0}
          </div>
        </div>
      </div>

      <div className="mt-5 border border-gray-300 rounded-lg">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 border-b border-gray-300 justify-between">
          <div className="flex items-center gap-4">
            {/* <div className="font-lg font-bold text-gray-700 border border-gray-300 p-2 rounded-lg">Trạng thái</div> */}
            <Dropdown
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
            </Dropdown>
          </div>
          <div className="flex items-center gap-3 pr-4">
            <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
            <p className="font-lg font-bold text-green-700 rounded-lg">
              {Array.isArray(branchesData) ? branchesData.length : 0}
            </p>
          </div>
        </div>
        <Table<Branch>
          columns={columns}
          dataSource={branchesData}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>

      <FormModal
        isOpen={isOpenModal}
        onClose={closeModal}
        mode={modalMode}
        title={
          modalMode === FormModalModes.CREATE
            ? "Thêm chi nhánh mới"
            : "Chỉnh sửa chi nhánh"
        }
        fields={branchEditFormFields}
        initialValues={selectedBranch || defaultBranchData}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default Branches;
