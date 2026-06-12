import { CiCirclePlus } from "react-icons/ci";
import { FaCaretDown, FaRegBuilding } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import { Button, Dropdown, message, Space, Table, Tag } from "antd";
import type { MenuProps, TableProps } from "antd";
import { useGetBranches } from "../../../shared/hooks/useBranch";
import type { Branch } from "../types/branch-type";
import { useEffect, useState } from "react";
import { updateBranch } from "../api/admin-api";
import { useNavigate } from "react-router-dom";

interface DataType {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  description: string;
  is_active: boolean;
}

const branch = () => {
  const [loading, setLoading] = useState(false);
  const [branchesData, setBranchesData] = useState<Branch[]>([]);
  const { data: branches = [] } = useGetBranches();
  const navigate = useNavigate();

  useEffect(() => {
    setBranchesData(branches);
  }, [branches]);

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
      await updateBranch(branchId, branchData);
       setBranchesData(prevData =>
        prevData.map(item =>
          item.id === branchId
            ? { ...item, is_active: branchData.is_active }
            : item
        )
      );
      message.success("Cập nhật trạng thái chi nhánh thành công");
    } catch (error) {
      message.error("Cập nhật trạng thái chi nhánh thất bại");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableProps<DataType>["columns"] = [
    {
      title: "Branch Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.name.localeCompare(b.name),
      defaultSortOrder: "ascend",
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      key: "is_active",
      dataIndex: "is_active",
      render: (text, record: DataType) => {
        // Tạo items động với onClick cho từng branch
        const dynamicStatusItems: MenuProps["items"] = [
          {
            key: "active",
            label: "Active",
            onClick: () => handleStatusChange(record.id, { is_active: true }), 
          },
          {
            key: "inactive",
            label: "Inactive",
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
          <Button onClick={() => navigate(`/admin/branches/edit/${record.id}`)}>
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
        <div className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium" onClick={() => navigate("/admin/branches/add")}>
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
          <div className="text-2xl font-bold ">{branches.length}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-green-500">
              Đang hoạt động
            </span>
            <IoIosCheckmarkCircleOutline className="text-green-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {branchesData.filter((item: Branch) => item.is_active).length}
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
            {branchesData.filter((item: Branch) => !item.is_active).length}
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
              {branches.length}
            </p>
          </div>
        </div>
        <Table<DataType>
          columns={columns}
          dataSource={branchesData}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default branch;
