import type { FormFieldType } from "./type-form-field";

export interface FormField<T> {
  key: keyof T;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: any }[];
  fetchOptions?: () => Promise<any>;
  defaultValue?: any;
  rules?: any[];
  customData?: (data: any) => any;
  componentProps?: Record<string, any>; 
  hideInUpdateMode?: boolean; 
}