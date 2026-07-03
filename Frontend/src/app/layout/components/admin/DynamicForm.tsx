import SelectFetchCustom from "@/shared/components/select/SelectFetchCustom";
import UploadImageCustom from "@/shared/components/upload/UploadImageCustom";
import ExtraAmenitiesInput from "@/shared/components/input/AmenitiesInput";
import type { FormField } from "@/shared/types/form-field";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { Checkbox, DatePicker, Input, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import CustomerSelectWithAdd from "@/shared/components/input/CustomerSelectWithAdd";

type DynamicFormProps<T extends object> = {
  fields: FormField<T>[];
  values: T;
  onChange: (key: keyof T, value: unknown) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
};

const DynamicForm = <T extends object>({
  fields,
  values,
  onChange,
  errors = {},
  disabled = false,
}: DynamicFormProps<T>) => {
  const renderField = (field: FormField<T>) => {
    const key = field.key;
    const value = values[key];

    switch (field.type) {
      case FormFieldTypes.INPUT:
        return (
          <Input
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={disabled} // Thêm disabled
          />
        );

      case FormFieldTypes.IMAGE_UPLOAD:
        return (
          <UploadImageCustom
            value={[]}
            onChange={(files) => onChange(key, files)}
            disabled={disabled}
            maxCount={5}
          />
        );

      case FormFieldTypes.TEXTAREA:
        return (
          <Input.TextArea
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={disabled} // Thêm disabled
          />
        );

      case FormFieldTypes.SELECT:
        return (
          <Select
            placeholder={field.placeholder}
            value={(value as any) || undefined}
            options={field.options}
            onChange={(value) => onChange(key, value)}
            allowClear
            disabled={disabled} // Thêm disabled
          />
        );

      case FormFieldTypes.CHECKBOX:
        return (
          <Checkbox
            checked={Boolean(value)}
            onChange={(e) => onChange(key, e.target.checked)}
            disabled={disabled} // Thêm disabled
          >
            {field.label}
          </Checkbox>
        );

      case FormFieldTypes.NUMBER:
        return (
          <Input
            type="number"
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(key, Number(e.target.value))}
            disabled={disabled} // Thêm disabled
          />
        );

      case FormFieldTypes.DATE:
        return (
          <Input
            type="date"
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={disabled} // Thêm disabled
          />
        );

      case FormFieldTypes.TIME:
        return (
          <Input
            type="time"
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={disabled} // Thêm disabled
          />
        );

      case FormFieldTypes.DATE_PICKER:
        return (
          <DatePicker
            placeholder={field.placeholder}
            value={value ? dayjs(value as any) : null}
            onChange={(d: Dayjs | null) => onChange(key, d ? d.toDate() : null)}
            disabled={disabled}
            // call user-provided disabledDate function with current values
            disabledDate={(current: Dayjs) =>
              field.componentProps?.disabledDate
                ? field.componentProps.disabledDate(current, values)
                : false
            }
            {...(field.componentProps ?? {})}
          />
        );

      case FormFieldTypes.TIME_PICKER:
        return (
          <Input
            type="time"
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={disabled} // Thêm disabled
          />
        );

      case FormFieldTypes.PASSWORD:
        return (
          <Input.Password
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={disabled} // Thêm disabled
          />
        );

      case FormFieldTypes.RADIO:
        return (
          <Select
            placeholder={field.placeholder}
            value={value}
            options={field.options}
            onChange={(value) => onChange(key, value)}
            disabled={disabled} // Thêm disabled
          />
        );

      case FormFieldTypes.SELECT_FETCH:
        if (field.componentProps?.allowAddCustomer) {
          return (
            <CustomerSelectWithAdd
              value={(value as any) || undefined}
              onChange={(val) => onChange(key, val)}
              disabled={disabled}
              placeholder={field.placeholder}
            />
          );
        }
        return (
          <SelectFetchCustom
            placeholder={field.placeholder}
            fetchOptions={field.fetchOptions}
            value={(value as any) || undefined}
            onChange={(value) => onChange(key, value)}
            disabled={disabled} // Thêm disabled
            customData={field.customData}
          />
        );

      case FormFieldTypes.ARRAY_INPUT:
        return (
          <ExtraAmenitiesInput
            value={Array.isArray(value) ? value : []}
            onChange={(newValue) => onChange(key, newValue)}
            disabled={disabled}
            placeholder={field.placeholder}
          />
        );

      case FormFieldTypes.EMAIL:
        return (
          <Input
            type="email"
            placeholder={field.placeholder}
            value={String(value ?? "")}
            onChange={(e) => onChange(key, e.target.value)}
            disabled={disabled} // Thêm disabled
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field) => (
        <div key={String(field.key)} className="flex flex-col gap-1">
          <label className="font-medium">
            {field.rules?.some((rule) => rule.required) && (
              <span className="text-red-500 ml-1">* </span>
            )}
            {field.label}
          </label>
          {renderField(field)}
          {errors[String(field.key)] && (
            <div className="text-red-500 text-sm">
              {errors[String(field.key)]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default DynamicForm;
