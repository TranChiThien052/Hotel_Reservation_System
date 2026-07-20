import { useAppSelector } from "@/app/store/hooks";
import { historyTransactionApi } from "@/features/admin/adminHistoryTransaction/api/historyTransaction";
import HistoryTransactionDetailModal from "@/features/admin/adminHistoryTransaction/components/HistoryTransactionDetailModal";
import type { HistoryTransaction } from "@/features/admin/adminHistoryTransaction/types/historyTransactions-type";
import { Button, Table } from "antd";
import message from "antd/es/message";
import Space from "antd/es/space";
import type { TableProps } from "antd/es/table/InternalTable";
import { useCallback, useEffect, useState } from "react";
import { FaRegBuilding, FaRegCheckCircle } from "react-icons/fa";
import { LuWrench } from "react-icons/lu";

const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

const ManagerHistoryTransactions = () => {
    const [transactionsData, setTransactionsData] = useState<HistoryTransaction[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<HistoryTransaction[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
    const [selectedTransaction, setSelectedTransaction] = useState<HistoryTransaction | null>(null);
    const user = useAppSelector((state) => state.auth.user);

    const handleOpenDetail = (record: HistoryTransaction) => {
        setSelectedTransaction(record);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetail = () => {
        setIsDetailModalOpen(false);
        setSelectedTransaction(null);
    };

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await historyTransactionApi.getByBranchId(user?.branch_id || "");
            setTransactionsData(data);
            setFilteredTransactions(data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
            message.error("Đã xảy ra lỗi khi tải danh sách giao dịch. Vui lòng thử lại.");
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);
    console.log("transactionsData", transactionsData);


    const columns: TableProps<HistoryTransaction>["columns"] = [
      {
      title: "Ngày thực hiện",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => <p className="text-blue-500 font-bold">{formatDateTime(text)}</p>,
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      defaultSortOrder: "ascend",
    },
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
      render: (text) => <p className="text-green-600">{text}</p>,
    },
    {
      title: "Chi nhánh",
      key: "accounts.branches.name",
      render: (_, record) => <p>{record.accounts?.branches?.name}</p>,
    },
    {
      title: "Người thực hiện",
      key: "accounts.id",
      render: (_, record) => <p>{record.accounts?.customer?.full_name || record.accounts?.staff?.full_name}</p>,
    },
    {
      title: "Vai trò",
      dataIndex: "accounts.role",
      key: "accounts.role",
      render: (_,  record) => <p>{record.accounts?.role === "manager" ? "Quản lý" : record.accounts?.role === "staff" ? "Nhân viên" : record.accounts?.role === "customer" ? "Khách hàng" : record.accounts?.role === "admin" ? "Quản trị viên" : record.accounts?.role}</p>,
    },
    {
        title: "Mô tả",
        key: "description",
        render: (_, record) => <p>{record.description}</p>
    },
    {
        title: "Mục tiêu",
        key: "target_type",
        render: (_, record) => <p>{record.target_type}</p>
    },
    {
      title: "Hành động",
      key: "action_buttons",
      render: (_, record) => (
        <Space size="middle">
          <Button onClick={() => handleOpenDetail(record)} type="dashed">
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
            <p className="text-3xl font-bold">Quản lý nhật ký hoạt động</p>
            <p className="text-gray-600">
              Danh sách các hoạt động trong hệ thống khách sạn Aurora
            </p>
          </div>
          
        </div>
  
        <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
          <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-between">
              <span className="font-xl font-bold text-blue-500">
                Tổng giao dịch
              </span>
              <FaRegBuilding className="text-blue-500 text-2xl" />
            </div>
            <div className="text-2xl font-bold ">
              {Array.isArray(transactionsData) ? transactionsData.length : 0}
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
              {/* <Input
                placeholder="Tìm kiếm..."
                prefix={<IoSearch className="text-xl" />}
                onChange={(e) => handleSearch(e.target.value)}
              /> */}
            </div>
            <div className="flex items-center gap-3 pr-4">
              <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
              <p className="font-lg font-bold text-green-700 rounded-lg">
                {Array.isArray(filteredTransactions) ? filteredTransactions.length : 0}
              </p>
            </div>
          </div>
          <Table<HistoryTransaction>
            columns={columns}
            dataSource={filteredTransactions}
            loading={loading}
            pagination={{ pageSize: 5 }}
            rowKey="id"
          />
        </div>

        <HistoryTransactionDetailModal 
            open={isDetailModalOpen} 
            onClose={handleCloseDetail} 
            transaction={selectedTransaction} 
        />
      </div>
    );
}

export default ManagerHistoryTransactions