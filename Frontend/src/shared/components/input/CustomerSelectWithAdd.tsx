import { customersApi } from "@/features/admin/adminCustomers/api/customers-api";
import type { CustomerFormData } from "@/features/admin/adminCustomers/types/customers-type";
import message from "antd/es/message";
import { useState } from "react";
import SelectFetchCustom from "../select/SelectFetchCustom";
import { UserAddOutlined } from "@ant-design/icons";
import FormModal from "@/app/layout/components/admin/FormModal";
import { FormModalModes } from "@/shared/types/type-form-mode";
import { customersFormFields } from "@/features/admin/adminCustomers/constants/customers-form-fields";
import { Button } from "antd";

const defaultCustomerData: CustomerFormData = {
  full_name: "",
  phone: "",
  email: "",
  id_card_number: "",
  date_of_birth: "",
  nationality: "",
  address: "",
};

interface CustomerSelectWithAddProps {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

const CustomerSelectWithAdd = ({ value, onChange, disabled, placeholder }: CustomerSelectWithAddProps) => {
    const [modalOpen, setModalOpen] = useState(false);
  // Thay đổi key để force SelectFetchCustom re-fetch lại data
  const [fetchKey, setFetchKey] = useState(0);
  // Hàm này được gọi khi người dùng nhấn "Lưu lại" trong FormModal
  const handleSubmit = async (values: CustomerFormData) => {
    try {
      const newCustomer = await customersApi.createCustomer(values);
      message.success("Thêm khách hàng thành công!");
      // Force re-fetch danh sách (re-mount SelectFetchCustom bằng cách đổi key)
      setFetchKey((k) => k + 1);
      // Tự động chọn khách hàng vừa tạo
      // ⚠️ Kiểm tra lại cấu trúc response API của bạn:
      //   - Nếu API trả về trực tiếp object: newCustomer.id
      //   - Nếu API bọc trong data: newCustomer.data.id
      onChange?.(newCustomer.id);
      setModalOpen(false);
    } catch (error) {
      message.error("Có lỗi xảy ra khi thêm khách hàng");
    }
  };
   return (
    <>
      <div className="flex items-center gap-2">
        {/* SelectFetchCustom dùng key để trigger re-fetch khi có khách hàng mới */}
        <div className="flex-1">
          <SelectFetchCustom
            key={fetchKey}
            placeholder={placeholder}
            fetchOptions={customersApi.getAllCustomers}
            value={value || undefined}
            onChange={onChange}
            disabled={disabled}
            customData={(data: any[]) =>
              data.map((item) => ({ label: item.full_name, value: item.id }))
            }
          />
        </div>
        {/* Nút "+" chỉ hiển thị khi không ở chế độ view (disabled) */}
        {!disabled && (
          <Button
            type="dashed"
            icon={<UserAddOutlined />}
            onClick={() => setModalOpen(true)}
            title="Thêm khách hàng mới"
          />
        )}
      </div>
      {/* Tận dụng lại FormModal + customersFormFields của admin */}
      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={FormModalModes.CREATE}
        title="Thêm khách hàng mới"
        fields={customersFormFields}
        initialValues={defaultCustomerData}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default CustomerSelectWithAdd;
