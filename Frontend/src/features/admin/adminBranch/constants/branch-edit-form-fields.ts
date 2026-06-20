import type { FormField } from "@/shared/types/form-field";
import { rules } from "../../../../shared/util/rules";
import type { BranchFormData } from "../types/branch-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { branchApi } from "../api/admin-api";

export const branchEditFormFields: FormField<BranchFormData>[] = [
    {
        key: "name",
        label: "Tên chi nhánh",
        placeholder: "Nhập tên chi nhánh",
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
        label: "Thành phố",
        placeholder: "Nhập thành phố",
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
        label: "Địa chỉ",
        placeholder: "Nhập địa chỉ",
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
        label: "Số điện thoại",
        placeholder: "Nhập số điện thoại",
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
        placeholder: "Nhập email",
        type: FormFieldTypes.EMAIL,
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
        label: "Mô tả",
        placeholder: "Nhập mô tả",
        type: FormFieldTypes.TEXTAREA
    },
    {
        key: "is_active",
        label: "Trạng thái",
        placeholder: "Chọn trạng thái",
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