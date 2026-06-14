import type { FormField } from "@/shared/types/form-field";
import { rules } from "../../../../shared/util/rules";
import type { BranchFormData } from "../types/branch-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { branchApi } from "../api/admin-api";

export const branchEditFormFields: FormField<BranchFormData>[] = [
    {
        key: "name",
        label: "Branch Name",
        placeholder: "Enter branch name",
        type: FormFieldTypes.INPUT,
        rules:[
            {
                required: true,
                message: "Vui lòng nhập tên chi nhánh"
            }
        ]

    },
    {
        key: "city",
        label: "City",
        placeholder: "Enter city",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getCityOptions,
        rules:[
            {
                required: true,
                message: "Vui lòng nhập thành phố"
            }
        ],
        customData: (data: any[]) => data.map((item) => ({ label: item.name, value: item.name })) // Chuyển đổi dữ liệu thành format { label, value }
    },
    {
        key: "address",
        label: "Address",
        placeholder: "Enter address",
        type: FormFieldTypes.INPUT,
        rules:[
            {
                required: true,
                message: "Vui lòng nhập địa chỉ"
            }
        ]
    },
    {
        key: "phone",
        label: "Phone Number",
        placeholder: "Enter phone number",
        type: FormFieldTypes.INPUT,
        rules:[
            {
                required: true,
                message: "Vui lòng nhập số điện thoại"
            },
            rules.phone,
        ]
    },
    {
        key: "email",
        label: "Email",
        placeholder: "Enter email",
        type: FormFieldTypes.INPUT,
        rules:[
            {
                required: true,
                message: "Vui lòng nhập email"
            },
            rules.email,
        ]
    },
    {
        key: "description",
        label: "Description",
        placeholder: "Enter description",
        type: FormFieldTypes.TEXTAREA
    },
    {
        key: "is_active",
        label: "Status",
        placeholder: "Select status",
        type: FormFieldTypes.SELECT,
        options: [
            { label: "Active", value: true },
            { label: "Inactive", value: false },
        ],
        rules:[
            {
                required: true,
                message: "Vui lòng chọn trạng thái"
            }
        ]
    }
]