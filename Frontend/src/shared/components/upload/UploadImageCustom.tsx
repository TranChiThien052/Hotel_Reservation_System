import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";

// Lấy kiểu FileType từ Ant Design
type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];

// ─── Kiểu ảnh đã có trên server ────────────────────────────────────────────
export interface ExistingImage {
  image_url: string;
  image_public_id: string;
}

// ─── Props ─────────────────────────────────────────────────────────────────
export interface UploadMultiImageCustomProps {
  /** Mảng ảnh đã có trên server (có cả url và public_id) */
  value?: ExistingImage[];
  /** Callback trả về danh sách File mới được thêm vào */
  onChange?: (files: File[]) => void;
  /** Callback được gọi ngay khi user xóa một ảnh đã có trên server */
  onRemoveExisting?: (img_url: string, public_id: string) => void;
  disabled?: boolean;
  maxCount?: number;
}

// ─── Component ─────────────────────────────────────────────────────────────
const UploadMultiImageCustom = ({
  value = [],
  onChange,
  onRemoveExisting,
  disabled = false,
  maxCount = 5,
}: UploadMultiImageCustomProps) => {
  // Khởi tạo fileList từ các ảnh đã có (khi mở form Edit)
  // Lưu public_id vào field `response` để truy xuất khi xóa
  const [fileList, setFileList] = useState<UploadFile[]>(() =>
    (value ?? []).map((img, i) => ({
      uid: `existing-${i}`,
      name: `image-${i + 1}.png`,
      status: "done" as const,
      url: img.image_url,
      // Lưu lại metadata để dùng khi onRemove
      response: { image_url: img.image_url, image_public_id: img.image_public_id },
    }))
  );

  // ─── 1. Validate trước khi upload ────────────────────────────────────────
  const beforeUpload = (file: FileType) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Chỉ được tải lên file hình ảnh!");
      return Upload.LIST_IGNORE;
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
    return true;
  };

  // ─── 2. Custom request (không upload lên server, chỉ lưu local) ──────────
  const customRequest: UploadProps["customRequest"] = async (options) => {
    options.onSuccess?.({});
  };

  // ─── 3. Xử lý khi user nhấn xóa một ảnh ─────────────────────────────────
  const handleRemove = (file: UploadFile) => {
    // Nếu ảnh này là ảnh cũ từ server (có lưu response.image_public_id)
    const meta = file.response as ExistingImage | undefined;
    if (meta?.image_url && meta?.image_public_id && onRemoveExisting) {
      onRemoveExisting(meta.image_url, meta.image_public_id);
    }
    return true; // cho phép xóa khỏi fileList
  };

  // ─── 4. Xử lý sau khi danh sách file thay đổi ───────────────────────────
  const handleChange: UploadProps["onChange"] = ({ fileList: newList }) => {
    setFileList(newList);
    // Chỉ lấy các File object mới (ảnh vừa chọn từ máy)
    const newFiles = newList
      .filter((f) => f.originFileObj)
      .map((f) => f.originFileObj as File);
    onChange?.(newFiles);
  };

  return (
    <Upload
      accept="image/*"
      listType="picture-card"
      multiple
      maxCount={maxCount}
      fileList={fileList}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onRemove={handleRemove}
      onChange={handleChange}
      disabled={disabled}
    >
      {fileList.length < maxCount && !disabled && (
        <button className="border-0 bg-transparent cursor-pointer" type="button">
          <PlusOutlined />
          <div className="mt-2 text-xs">
            Tải ảnh ({fileList.length}/{maxCount})
          </div>
        </button>
      )}
    </Upload>
  );
};

export default UploadMultiImageCustom;
