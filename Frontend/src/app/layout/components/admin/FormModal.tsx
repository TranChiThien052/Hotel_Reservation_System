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
  fields: FormField<any>[] | ((formData: any) => FormField<any>[]);
  initialValues: T;
  onSubmit?: (values: T) => void;
  /** Callback được gọi khi user xóa ảnh đã có trên server */
  onRemoveImage?: (img_url: string, public_id: string) => void;
}

const FormModal = <T extends object>({
  isOpen,
  onClose,
  mode,
  title,
  fields,
  initialValues,
  onSubmit,
  onRemoveImage,
}: FormModalProps<T>) => {
  const [formData, setFormData] = useState<any>(initialValues);


  const [prevInitialValues, setPrevInitialValues] = useState<T>(initialValues);

  const [errors, setErrors] = useState<Record<string, string>>({});

 
  if (initialValues !== prevInitialValues) {
    setPrevInitialValues(initialValues);
    setFormData(initialValues);
    setErrors({});
  }

  const isViewMode = mode === FormModalModes.VIEW;
  const isUpdateMode = mode === FormModalModes.UPDATE;

  const resolvedFields = typeof fields === 'function' ? fields(formData) : fields;

  const activeFields = resolvedFields.filter((field) => {
    if (isUpdateMode && field.hideInUpdateMode) {
      return false;
    }
    return true;
  });

  
  const handleChange = (key: string, value: unknown) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
   
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

    
    const submitData = { ...formData };
    resolvedFields.forEach((field) => {
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
          <h3 className="text-lg font-bold text-blue-600 mb-4">Thông tin</h3>
          <DynamicForm
            fields={activeFields}
            values={formData}
            onChange={(key, val) => handleChange(key as string, val)}
            disabled={isViewMode}
            errors={errors}
            onRemoveImage={onRemoveImage}
          />
        </div>

      </div>
    </Modal>
  );
};

export default FormModal;