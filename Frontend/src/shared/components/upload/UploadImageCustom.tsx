import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";

// Lấy kiểu FileType từ Ant Design
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

// ─── Props ─────────────────────────────────────────────────────────────────
export interface UploadMultiImageCustomProps {
  value?: string[]; // Mảng URL ảnh hiện tại
  onChange?: (file: File[]) => void; // Callback trả mảng URL về Form
  disabled?: boolean;
  maxCount?: number; // Mặc định 5
}

// ─── Component ─────────────────────────────────────────────────────────────
const UploadMultiImageCustom = ({
  value = [],
  onChange,
  disabled = false,
  maxCount = 5,
}: UploadMultiImageCustomProps) => {
  // Khởi tạo fileList từ các URL ảnh đã có (khi mở form Edit)
  const [fileList, setFileList] = useState<UploadFile[]>(() =>
    value.map((url, i) => ({
      uid: `existing-${i}`,
      name: `image-${i + 1}.png`,
      status: "done",
      url, // ← Ant Design dùng url để hiển thị preview
    })),
  );

  // ─── 1. Validate trước khi upload ────────────────────────────────────────
  const beforeUpload = (file: FileType) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được tải lên file hình ảnh!");
      return Upload.LIST_IGNORE; // Bỏ qua file này, không thêm vào list
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Kích thước ảnh phải nhỏ hơn 5MB!");
      return Upload.LIST_IGNORE;
    }

    if (fileList.length >= maxCount) {
      message.warning(`Chỉ được tải lên tối đa ${maxCount} ảnh!`);
      return Upload.LIST_IGNORE;
    }

    return true; // Cho phép upload
  };

  // ─── 2. Custom request (không cần server thật) ───────────────────────────
  // Khi backend upload ảnh sẵn sàng, thay đoạn này bằng API call thực
  const customRequest: UploadProps["customRequest"] = async (options) => {
    options.onSuccess?.({});
  };

  // ─── 3. Xử lý sau khi danh sách file thay đổi ───────────────────────────
  const handleChange: UploadProps["onChange"] = ({ fileList: newList }) => {
    setFileList(newList);
    // Lấy File object thật từ originFileObj
    const files = newList
      .filter((f) => f.status === "done" && f.originFileObj)
      .map((f) => f.originFileObj as File);
    onChange?.(files); // ← Trả File[] về cho form state
  };

  return (
    <Upload
      accept="image/*"
      listType="picture-card" // Hiển thị dạng lưới ảnh thumbnail
      multiple // Cho phép chọn nhiều file cùng lúc
      maxCount={maxCount}
      fileList={fileList}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onChange={handleChange}
      disabled={disabled}
    >
      {/* Ẩn nút "+" khi đã đủ số lượng hoặc bị disable */}
      {fileList.length < maxCount && !disabled && (
        <button style={{ border: 0, background: "none" }} type="button">
          <PlusOutlined />
          <div style={{ marginTop: 8, fontSize: 12 }}>
            Tải ảnh ({fileList.length}/{maxCount})
          </div>
        </button>
      )}
    </Upload>
  );
};

export default UploadMultiImageCustom;
