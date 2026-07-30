import { useCallback, useEffect, useState } from "react";
import type { CancellationRequestType } from "../types/cancellationRequest-type";
import type { TableProps } from "antd/es/table/InternalTable";
import message from "antd/es/message";
import { cancellationRequestApi } from "../api/cancellationRequest-type";
import { Button, Input, Space, Table } from "antd";
import { FaRegBuilding } from "react-icons/fa6";
import DetailCancellationRequestModal from "../components/DetailCancellationRequestModal";
import { useAppSelector } from "@/app/store/hooks";
import { IoSearch } from "react-icons/io5";

const formatVND = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const CancellationRequest = () => {
    const [cancellationRequestsData, setCancellationRequestsData] = useState<CancellationRequestType[]>([]);
    const [filteredCancellationRequests, setFilteredCancellationRequests] = useState<CancellationRequestType[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<boolean>(false);
    const [selectedRequest, setSelectedRequest] = useState<CancellationRequestType | null>(null);
    const user = useAppSelector((state) => state.auth.user);
    const branchId = user?.branch_id;

    const fetchCancellationRequests = useCallback( async () => {
        setLoading(true);
        if (!branchId) {
            message.error("Không tìm thấy chi nhánh của người dùng. Vui lòng đăng nhập lại.");
            setLoading(false);
            return;
        }
        try {
            const data = await cancellationRequestApi.getByBranchId(branchId);
            setCancellationRequestsData(data);
            setFilteredCancellationRequests(data);
        } catch (error) {
            console.error("Error fetching cancellation requests:", error);
            message.error("Đã xảy ra lỗi khi tải danh sách yêu cầu hủy. Vui lòng thử lại.");
        }
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCancellationRequests();
    }, [fetchCancellationRequests]);

    const handleOpenDetail = (record: CancellationRequestType) => {
        setSelectedRequest(record);
        setOpenModal(true);
    }

    const handleCloseDetail = () => {
        setOpenModal(false);
        setSelectedRequest(null);
    }

    const handleSearch = (searchTerm: string) => {
    if (!searchTerm) {
      setFilteredCancellationRequests(cancellationRequestsData);
      return;
    }
    setFilteredCancellationRequests(
      cancellationRequestsData.filter((cr) =>
        cr.bookings?.booking_code.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  };

    console.log("cancellationRequestsData:", cancellationRequestsData);


    const columns: TableProps<CancellationRequestType>["columns"] = [
    
    {
      title: "Mã đặt phòng",
      key: "bookings.booking_code",
      render: (_, record) => <p>{record.bookings?.booking_code}</p>,
    },
    {
      title: "Ngày yêu cầu",
      key: "created_at",
      render: (_, record) => <p>{new Date(record.created_at).toLocaleString()}</p>,
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: "Trạng thái",
      key: "status",
      render: (_, record) => {
        if (record.status === 'pending') {
          return <p className="text-yellow-500">Đang chờ</p>;
        } else if (record.status === 'confirmed') {
          return <p className="text-green-500">Đã duyệt</p>;
        } else {
          return <p className="text-red-500">Từ chối</p>;
        }
      },
    },
    {
      title: "Số tiền hoàn lại",
      key: "refund_amount",
      render: (_, record) => <p>{formatVND(record.refund_amount || 0)}</p>,
    },
    {
      title: "Lý do",
      key: "reason",
      render: (_, record) => <p>{record.reason}</p>,
    },
    {
        title: "Ghi chú",
        key: "notes",
        render: (_, record) => <p>{record.notes}</p>
    },
    {
      title: "Hành động",
      key: "action_buttons",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Button type="dashed" size="small" onClick={() => handleOpenDetail(record)}>
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="p-7 flex flex-col gap-5 ">
        <div className="flex items-center justify-between mt-3">
          <div className="flex flex-col gap-1">
            <p className="text-3xl font-bold">Quản lý yêu cầu hủy</p>
            <p className="text-gray-600">
              Danh sách các yêu cầu hủy trong hệ thống khách sạn Aurora
            </p>
          </div>
          
        </div>
  
        <div className="grid grid-cols-3 gap-5 w-2/3 mx-auto mt-4">
          <div className="bg-white rounded-lg border border-gray-300 shadow p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2 justify-between">
              <span className="font-xl font-bold text-blue-500">
                Tổng yêu cầu hủy
              </span>
              <FaRegBuilding className="text-blue-500 text-2xl" />
            </div>
            <div className="text-2xl font-bold ">
              {Array.isArray(cancellationRequestsData) ? cancellationRequestsData.length : 0}
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
            </div>
            <div className="flex items-center gap-3 pr-4">
              <p className="font-lg font-bold text-gray-700">Hiển thị:</p>
              <p className="font-lg font-bold text-green-700 rounded-lg">
                {Array.isArray(filteredCancellationRequests) ? filteredCancellationRequests.length : 0}
              </p>
            </div>
          </div>
          <Table<CancellationRequestType>
            columns={columns}
            dataSource={filteredCancellationRequests}
            loading={loading}
            pagination={{ pageSize: 5 }}
            rowKey="id"
          />
        </div>
      </div>

      <DetailCancellationRequestModal
        open={openModal}
        onClose={handleCloseDetail}
        cancellationRequest={selectedRequest}
        onUpdated={fetchCancellationRequests}
      />
      </>
    );
}

export default CancellationRequest;