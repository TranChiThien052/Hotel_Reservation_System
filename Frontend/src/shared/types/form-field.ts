import type { FormFieldType } from "./type-form-field";

export interface FormField<T> {
  key: keyof T;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: any }[];
  fetchOptions?: () => Promise<any>;
  rules?: any[];
  customData?: (data: any) => any; // Hàm tùy chỉnh để xử lý dữ liệu nếu cần thiết\
  componentProps?: Record<string, any>; // Thuộc tính tùy chỉnh cho component, ví dụ như DatePicker, Select
}