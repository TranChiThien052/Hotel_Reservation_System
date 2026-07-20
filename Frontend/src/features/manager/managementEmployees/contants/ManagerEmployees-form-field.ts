import type { EmployeeFormData } from "@/features/admin/adminEmployees/types/employees-type";
import type { FormField } from "@/shared/types/form-field";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { rules } from "@/shared/util/rules";

export const managerEmployeesFormFields: FormField<EmployeeFormData>[] = [
    {
            key: "full_name",
            label: "Họ và tên",
            placeholder: "Nhập họ và tên",
            type: FormFieldTypes.INPUT,
        },
        {
            key: "phone",
            label: "Số điện thoại",
            placeholder: "Nhập số điện thoại",
            type: FormFieldTypes.INPUT,
            rules: [
                {
                    required: true,
                    message: "Vui lòng nhập số điện thoại"
                },
                rules.phone,
            ]
        },
        {
            key: "position",
            label: "Chức vụ",
            placeholder: "Chọn chức vụ",
            type: FormFieldTypes.SELECT,
            options: [
                { label: "Quản lý", value: "manager" },
                { label: "Nhân viên", value: "staff" },
            ],
        }
]