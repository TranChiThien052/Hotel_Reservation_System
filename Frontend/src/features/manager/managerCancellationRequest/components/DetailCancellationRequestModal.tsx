import { useState } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Button,
  Select,
  Divider,
  message,
  Spin,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  HomeOutlined,
} from "@ant-design/icons";
import type { CancellationRequestType } from "../types/cancellationRequest-type";
import { cancellationRequestApi } from "../api/cancellationRequest-type";
import { Option } from "antd/es/mentions";
import TextArea from "antd/es/input/TextArea";



const formatVND = (n: number) => (n ?? 0).toLocaleString("vi-VN") + " đ";
const formatDate = (d?: string) =>
  d ? new Date(d).toLocaleString("vi-VN") : "—";


type CancelStatus = "pending" | "confirmed" | "failed";

const CANCEL_STATUS: Record<
  CancelStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  pending:    { label: "Chờ xử lý",  color: "orange", icon: <ClockCircleOutlined /> },
  confirmed:   { label: "Đã duyệt",   color: "green",  icon: <CheckCircleOutlined /> },
  failed:   { label: "Từ chối",    color: "red",    icon: <CloseCircleOutlined /> },
};

const getCancelStatus = (s: string) =>
  CANCEL_STATUS[s as CancelStatus] ?? { label: s, color: "default", icon: null };


const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  pending:     { label: "Chờ xác nhận", color: "orange" },
  confirmed:   { label: "Đã xác nhận",  color: "blue" },
  checked_in:  { label: "Đã check-in",  color: "cyan" },
  checked_out: { label: "Đã check-out", color: "green" },
  cancelled:   { label: "Đã hủy",       color: "red" },
  no_show:     { label: "Không đến",    color: "default" },
};

const getBookingStatus = (s: string) =>
  BOOKING_STATUS[s] ?? { label: s, color: "default" };

interface Props {
  open: boolean;
  onClose: () => void;
  cancellationRequest: CancellationRequestType | null;
  onUpdated: () => void;
}

/* ─── Component ─── */
const DetailCancellationRequestModal = ({
  open,
  onClose,
  cancellationRequest,
  onUpdated,
}: Props) => {
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminNote, setAdminNote] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  if (!cancellationRequest) return null;

  const cancelCfg  = getCancelStatus(cancellationRequest.status);
  const bookingCfg = getBookingStatus(cancellationRequest.bookings?.status);

  const handleUpdate = async () => {
    if (!newStatus) {
      message.warning("Vui lòng chọn trạng thái mới.");
      return;
    }
    setUpdating(true);
    try {
      await cancellationRequestApi.update(cancellationRequest.id, {
        status: newStatus,
        notes: adminNote || cancellationRequest.notes,
      });
      message.success("Cập nhật trạng thái thành công!");
      setNewStatus("");
      setAdminNote("");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setUpdating(false);
    }
  };


  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-base">
            Chi tiết yêu cầu hủy phòng
          </span>
          <Tag icon={cancelCfg.icon} color={cancelCfg.color}>
            {cancelCfg.label}
          </Tag>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      centered
      destroyOnClose
    >
      <Spin spinning={updating}>
        <div className="flex flex-col gap-5 pt-3">

          {/* ── 1. Yêu cầu hủy ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileTextOutlined className="text-blue-500" />
              <span className="font-semibold text-gray-700">Thông tin yêu cầu hủy</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Descriptions bordered column={2} size="small" >
              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag icon={cancelCfg.icon} color={cancelCfg.color}>
                  {cancelCfg.label}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Tiền hoàn lại" span={1}>
                <span className="font-semibold text-green-600">
                  {formatVND(cancellationRequest.refund_amount || 0)}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Lý do hủy" span={2}>
                {cancellationRequest.reason || "—"}
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú" span={2}>
                {cancellationRequest.notes || "—"}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo" span={1}>
                {formatDate(cancellationRequest.created_at)}
              </Descriptions.Item>

              <Descriptions.Item label="Hoàn tiền lúc" span={1}>
                {formatDate(cancellationRequest.refund_processed_at)}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* ── 2. Thông tin đặt phòng ── */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <HomeOutlined className="text-blue-500" />
              <span className="font-semibold text-gray-700">Thông tin đặt phòng</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Mã đặt phòng" span={1}>
                <span className="font-bold text-blue-600">
                  {cancellationRequest.bookings?.booking_code || "—"}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái" span={1}>
                <Tag color={bookingCfg.color}>{bookingCfg.label}</Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Check-in" span={1}>
                {formatDate(cancellationRequest.bookings?.checkin_at)}
              </Descriptions.Item>

              <Descriptions.Item label="Check-out" span={1}>
                {formatDate(cancellationRequest.bookings?.checkout_at)}
              </Descriptions.Item>

              <Descriptions.Item label="Số khách" span={1}>
                {String(cancellationRequest.bookings?.num_guests ?? "—")} khách
              </Descriptions.Item>

              <Descriptions.Item label="Loại đặt phòng" span={1}>
                {cancellationRequest.bookings?.booking_type || "—"}
              </Descriptions.Item>

              <Descriptions.Item label="Giá phòng gốc" span={1}>
                {formatVND(Number(cancellationRequest.bookings?.room_price_snapshot) || 0)}
              </Descriptions.Item>

              <Descriptions.Item label="Giảm giá" span={1}>
                {formatVND(Number(cancellationRequest.bookings?.discount_amount) || 0)}
              </Descriptions.Item>

              <Descriptions.Item label="Tổng cộng" span={1}>
                <span className="font-bold text-red-600">
                  {formatVND(Number(cancellationRequest.bookings?.total_amount) || 0)}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Đặt cọc" span={1}>
                {formatVND(Number(cancellationRequest.bookings?.deposit_amount) || 0)}
              </Descriptions.Item>

              {cancellationRequest.bookings?.notes && (
                <Descriptions.Item label="Ghi chú phòng" span={2}>
                  {cancellationRequest.bookings.notes}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>

          {/* ── 3. Cập nhật trạng thái ── */}
          <div>
            <Divider className="my-1" />
            <p className="font-semibold text-gray-700 mb-3">Cập nhật trạng thái yêu cầu</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-32 shrink-0">Trạng thái mới:</span>
                <Select
                  placeholder="Chọn trạng thái..."
                  value={newStatus || undefined}
                  onChange={setNewStatus}
                  className="flex-1"
                >
                  {Object.entries(CANCEL_STATUS).map(([key, cfg]) => (
                    <Option
                      key={key}
                      value={key}
                      disabled={key === cancellationRequest.status}
                    >
                      <div className="flex items-center gap-2">
                        <Tag color={cfg.color} className="m-0">{cfg.label}</Tag>
                        {key === cancellationRequest.status && (
                          <span className="text-gray-400 text-xs">(hiện tại)</span>
                        )}
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="flex gap-3">
                <span className="text-sm text-gray-600 w-32 shrink-0 pt-1">Ghi chú:</span>
                <TextArea
                  rows={2}
                  placeholder="Ghi chú khi xử lý yêu cầu (tuỳ chọn)..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="flex-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={onClose}>Đóng</Button>
                <Button
                  type="primary"
                  onClick={handleUpdate}
                  disabled={!newStatus || newStatus === cancellationRequest.status}
                  loading={updating}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>

        </div>
      </Spin>
    </Modal>
  );
};

export default DetailCancellationRequestModal;