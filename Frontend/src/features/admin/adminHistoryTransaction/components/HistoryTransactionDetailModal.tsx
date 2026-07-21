import { Modal, Descriptions, Tag } from "antd";
import type { HistoryTransaction } from "../types/historyTransactions-type";




interface Props {
  open: boolean;
  onClose: () => void;
  transaction: HistoryTransaction | null;
}

const HistoryTransactionDetailModal = ({ open, onClose, transaction }: Props) => {
  if (!transaction) return null;

  // Format JSON metadata if any
  const formattedMetadata = transaction.metadata 
    ? JSON.stringify(transaction.metadata, null, 2)
    : "Không có dữ liệu";

  const getRoleLabel = (role: string) => {
    switch(role) {
      case "manager": return "Quản lý";
      case "staff": return "Nhân viên";
      case "customer": return "Khách hàng";
      case "admin": return "Quản trị viên";
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case "manager": return "blue";
      case "staff": return "green";
      case "admin": return "red";
      default: return "default";
    }
  };

  return (
    <Modal
      title={<div className="text-xl text-blue-600 font-bold border-b pb-2">Chi Tiết Nhật Ký Hoạt Động</div>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
      centered
    >
      <div className="mt-4 flex flex-col gap-4">
        <Descriptions bordered column={1} size="small" labelStyle={{ width: "150px", fontWeight: "bold", backgroundColor: "#f9fafb" }}>
          <Descriptions.Item label="Mã giao dịch (ID)">
            <span>{String(transaction.id)}</span>
          </Descriptions.Item>
          
          <Descriptions.Item label="Hành động">
            <Tag color="blue" className="text-sm">{transaction.action}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Thời gian">
            {new Date(transaction.created_at).toLocaleString("vi-VN")}
          </Descriptions.Item>

          <Descriptions.Item label="Người thực hiện">
            {transaction.accounts?.customer?.full_name || transaction.accounts?.staff?.full_name || "Không rõ"}
          </Descriptions.Item>

          <Descriptions.Item label="Vai trò">
            <Tag color={getRoleColor(transaction.accounts?.role)}>
              {getRoleLabel(transaction.accounts?.role)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Chi nhánh">
            {transaction.accounts?.branches?.name || "Hệ thống chung"}
          </Descriptions.Item>

          <Descriptions.Item label="Mục tiêu (Target)">
            <span className="text-gray-600">{transaction.target_type}</span> {transaction.target_id && `(ID: ${transaction.target_id})`}
          </Descriptions.Item>

          <Descriptions.Item label="Mô tả">
            {transaction.description}
          </Descriptions.Item>
        </Descriptions>

        <div className="flex flex-col gap-2 mt-2">
          <p className="font-bold text-gray-700">Dữ liệu chi tiết (Metadata):</p>
          <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm font-mono border border-gray-300 max-h-60 overflow-y-auto">
            {formattedMetadata}
          </pre>
        </div>
      </div>
    </Modal>
  );
};

export default HistoryTransactionDetailModal;