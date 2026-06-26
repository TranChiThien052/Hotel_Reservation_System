import {  useState } from 'react';
import { Modal, Button } from 'antd';
import DynamicForm from '@/app/layout/components/admin/DynamicForm';
import type { FormField } from '@/shared/types/form-field';
import { FormModalModes, type FormModalMode } from '@/shared/types/type-form-mode';
import validate from '@/shared/lib/validate';

interface FormModalProps<T extends object> {
  isOpen: boolean;
  onClose: () => void;
  mode: FormModalMode;
  title: string;
  fields: FormField<any>[];
  initialValues: T;
  onSubmit?: (values: T) => void;
}

const FormModal = <T extends object>({
  isOpen,
  onClose,
  mode,
  title,
  fields,
  initialValues,
  onSubmit,
}: FormModalProps<T>) => {
  const [formData, setFormData] = useState<any>(initialValues);

  // Lưu lại giá trị initialValues trước đó để so sánh
  const [prevInitialValues, setPrevInitialValues] = useState<T>(initialValues);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Nếu dữ liệu truyền vào thay đổi, ta cập nhật lại state formData
  if (initialValues !== prevInitialValues) {
    setPrevInitialValues(initialValues);
    setFormData(initialValues);
    setErrors({}); // Reset lỗi khi dữ liệu mới được load vào
  }

  const isViewMode = mode === FormModalModes.VIEW;
  const isUpdateMode = mode === FormModalModes.UPDATE;

  const activeFields = fields.filter((fields) => {
    if (isUpdateMode && fields.hideInUpdateMode) {
      return false;
    }
    return true;
  })

  // Xử lý thay đổi form 
  const handleChange = (key: string, value: unknown) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
    // Xóa lỗi khi người dùng bắt đầu sửa
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    const newErrors = validate(formData, activeFields);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    // Xử lý submit dữ liệu, loại bỏ các trường bị ẩn trong chế độ UPDATE
    const submitData = { ...formData };
    fields.forEach((field) => {
      if (isUpdateMode && field.hideInUpdateMode) {
        delete submitData[field.key];
      }
    });
    onSubmit?.(submitData);
  };

  


  return (
    <Modal
      title={title}
      open={isOpen}
      onCancel={onClose}
      destroyOnClose
      centered
      width={700}
      footer={[
        <Button key="cancel" onClick={onClose}>{isViewMode ? 'Đóng' : 'Hủy'}</Button>,
        !isViewMode && (
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {'Lưu lại'}
          </Button>
        ),
      ]}
    >
      <div className="mt-4 max-h-[75vh] overflow-y-auto p-1 flex flex-col">
        

        <div className={"bg-white p-4 border border-blue-200 rounded-md"}>
          <h3 className="text-lg font-bold text-blue-600 mb-4">Thông tin form</h3>
          <DynamicForm
            fields={activeFields}
            values={formData}
            onChange={(key, val) => handleChange(key as string, val)}
            disabled={isViewMode}
            errors={errors}
          />
        </div>

      </div>
    </Modal>
  );
};

export default FormModal;