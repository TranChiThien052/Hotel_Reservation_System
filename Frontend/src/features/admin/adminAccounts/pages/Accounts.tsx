import { useFormModal } from "@/shared/hooks/useFormModal";
import { useCallback, useEffect, useState } from "react";
import type { Account, AccountFormData } from "../types/accounts-type";
import { accountApi } from "../api/accounts-api";
import { Button, Dropdown, Input, message, Select, Space, Table, Tag, type MenuProps, type TableProps } from "antd";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { CiCirclePlus } from "react-icons/ci";
import { FaRegBuilding } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { LuWrench } from "react-icons/lu";
import FormModal from "@/app/layout/components/admin/FormModal";
import { accountsFormFields } from "../constants/accounts-form-field";
import { IoSearch } from "react-icons/io5";
import { USER_ROLE } from "../types/user-role-type";

const defaultAccountData: AccountFormData = {
  username: "",
  password: "",
  full_name: "",
  phone: "",
  role: USER_ROLE.STAFF,
  status: "",
  branch_id: "",
};

const Accounts = () => {
  const account = useFormModal<Account>();
  const [accountsData, setAccountsData] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await accountApi.getAllAccounts();
      setAccountsData(Array.isArray(data) ? data : []);
      setFilteredAccounts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      message.error(
        "Đã xảy ra lỗi khi tải danh sách tài khoản. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  console.log("accountsData:", accountsData);
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);


  const handleStatusChange = async (id: string, data: any) => {
    setLoading(true);
    console.log("Updating account status:", id, data);
    try {
      await accountApi.updateAccount(id, data);
      setAccountsData((prev) =>
        prev.map((account) =>
          account.id === id ? { ...account, status: data.status } : account,
        ),
      );
      message.success("Cập nhật trạng thái tài khoản thành công.");
      fetchAccounts(); 
    } catch (error) {
      console.error("Error updating account status:", error);
      message.error(
        "Đã xảy ra lỗi khi cập nhật trạng thái tài khoản. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatInitialValues = (
    record: Account | null | undefined,
    defaultData: AccountFormData,
  ): AccountFormData => {
    if (!record) return defaultData;

    const fullName = record.staff?.full_name || record.customers?.full_name || "";


    const phone = record.staff?.phone || record.customers?.phone || "";

    return {
      username: record.username,
      password: record.password,
      full_name: fullName,
      phone: phone, 
      role: record.role,
      status: record.status,
      branch_id: record.branch_id,
    };
  };


  const handleSubmitForm = async (values: AccountFormData) => {
    if (account.mode === FormModalModes.CREATE) {
      try {
        await accountApi.createStaffAccount(values);
        message.success("Tài khoản đã được tạo thành công.");
        account.close();
        fetchAccounts();
      } catch (error) {
        console.error("Error creating account:", error);
        message.error("Đã xảy ra lỗi khi tạo tài khoản. Vui lòng thử lại.");
      }
    } else if (
      account.mode === FormModalModes.UPDATE &&
      account.selectedRecord
    ) {
      try {
        await accountApi.updateAccount(account.selectedRecord.id, values);
        console.log("Updated account:", values);
        message.success("Tài khoản đã được cập nhật thành công.");
        account.close();
        fetchAccounts();
      } catch (error) {
        console.error("Error updating account:", error);
        message.error(
          "Đã xảy ra lỗi khi cập nhật tài khoản. Vui lòng thử lại.",
        );
      }
    }
  };

  const filterStatus = (value: string) => {
    if (value) {
      setFilteredAccounts(accountsData.filter((account) => account.status === value));
    } else {
      setFilteredAccounts(accountsData);
    }
  }

  const handleSearch = (searchTerm: string) => {
    const filtered = accountsData.filter((account) =>
      account.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAccounts(filtered);
  }

  const columns: TableProps<Account>["columns"] = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (text) => <a>{text}</a>,
      sorter: (a, b) => a.username.localeCompare(b.username),
      defaultSortOrder: "ascend",
    },
    {
      title: "Chi nhánh",
      key: "branches",
      render: (_, record) => <p>{record.branches.name}</p>,
    },
    {
      title: "Trạng thái",
      key: "status",
      dataIndex: "status",
      render: (text, record: Account) => {
        // Tạo items động với onClick cho từng branch
        const dynamicStatusItems: MenuProps["items"] = [
          {
            key: "active",
            label: <span className="text-green-600">Active</span>,
            onClick: () => handleStatusChange(record.id, { status: "active" }),
          },
          {
            key: "inactive",
            label: <span className="text-red-600">Inactive</span>,
            onClick: () => handleStatusChange(record.id, { status: "inactive" }),
          },
        ];

        return (
          <Dropdown
            menu={{ items: dynamicStatusItems }}
            trigger={["click"]} //Click để hiển thị
            placement="bottomLeft"
          >
            <Tag color={text === "active" ? "green" : "red"} style={{ cursor: "pointer" }}>
              {text === "active" ? "Active" : "Inactive"}
            </Tag>
          </Dropdown>
        );
      },
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="medium">
          <Button onClick={() => account.openEdit(record)} type="primary">
            Edit
          </Button>
          <Button onClick={() => account.openView(record)} type="dashed">
            Detail
          </Button>
        </Space>
      ),
    },
  ];

  
  return (
    <div className="p-7 flex flex-col gap-5 ">
      <div className="flex items-center justify-between mt-3">
        <div className="flex flex-col gap-1">
          <p className="text-3xl font-bold">Quản lý tài khoản</p>
          <p className="text-gray-600">
            Danh sách các tài khoản trong hệ thống khách sạn Aurora
          </p>
        </div>
        <div
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer text-lg font-medium"
          onClick={() => account.openCreate()}
        >
          <CiCirclePlus /> Thêm tài khoản mới
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-blue-500">Tổng tài khoản</span>
            <FaRegBuilding className="text-blue-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold ">
            {Array.isArray(accountsData) ? accountsData.length : 0}
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
            {Array.isArray(accountsData)
              ? accountsData.filter((item: Account) => item.status === "active").length
              : 0}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 justify-between">
            <span className="font-xl font-bold text-yellow-500">
              Dừng hoạt động
            </span>
            <LuWrench className="text-yellow-500 text-2xl" />
          </div>
          <div className="text-2xl font-bold">
            {Array.isArray(accountsData)
              ? accountsData.filter((item: Account) => item.status === "inactive").length
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

            <Input
              placeholder="Username..."
              prefix={<IoSearch className="text-xl" />}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pr-4">
            <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
            <p className="font-lg font-bold text-green-700 rounded-lg">
              {Array.isArray(filteredAccounts) ? filteredAccounts.length : 0}
            </p>
          </div>
        </div>
        <Table<Account>
          columns={columns}
          dataSource={filteredAccounts}
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </div>

      <FormModal
        isOpen={account.open}
        onClose={account.close}
        mode={account.mode}
        title={
          account.mode === FormModalModes.CREATE
            ? "Thêm tài khoản mới"
            : "Chỉnh sửa tài khoản"
        }
        fields={accountsFormFields}
        initialValues={formatInitialValues(account.selectedRecord, defaultAccountData)}
        onSubmit={handleSubmitForm}
      />
    </div>
  );
};

export default Accounts;
