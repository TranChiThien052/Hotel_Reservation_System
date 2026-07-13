import type { FormField } from "@/shared/types/form-field";
import type { EmployeeFormData } from "../types/employees-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { rules } from "@/shared/util/rules";
import { branchApi } from "../../adminBranch/api/admin-api";

export const emplloyeesFormFields: FormField<EmployeeFormData>[] = [
    {
        key: "branch_id",
        label: "Chi nhánh",
        placeholder: "Chọn chi nhánh",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getBranches,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id}))
    },
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