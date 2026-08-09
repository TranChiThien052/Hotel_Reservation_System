import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { message, Upload } from "antd";
import type { GetProp, UploadFile, UploadProps } from "antd";


type FileType = Parameters<GetProp<UploadProps, "beforeUpload">>[0];


export interface ExistingImage {
  image_url: string;
  image_public_id: string;
}


export interface UploadMultiImageCustomProps {

  value?: ExistingImage[];

  onChange?: (files: File[]) => void;

  onRemoveExisting?: (img_url: string, public_id: string) => void;
  disabled?: boolean;
  maxCount?: number;
}


const UploadMultiImageCustom = ({
  value = [],
  onChange,
  onRemoveExisting,
  disabled = false,
  maxCount = 5,
}: UploadMultiImageCustomProps) => {

  const [fileList, setFileList] = useState<UploadFile[]>(() =>
    (value ?? []).map((img, i) => ({
      uid: `existing-${i}`,
      name: `image-${i + 1}.png`,
      status: "done" as const,
      url: img.image_url,

      response: { image_url: img.image_url, image_public_id: img.image_public_id },
    }))
  );


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


  const customRequest: UploadProps["customRequest"] = async (options) => {
    options.onSuccess?.({});
  };


  const handleRemove = (file: UploadFile) => {

    const meta = file.response as ExistingImage | undefined;
    if (meta?.image_url && meta?.image_public_id && onRemoveExisting) {
      onRemoveExisting(meta.image_url, meta.image_public_id);
    }
    return true; 
  };


  const handleChange: UploadProps["onChange"] = ({ fileList: newList }) => {
    setFileList(newList);

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
