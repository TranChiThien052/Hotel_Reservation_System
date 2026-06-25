import type { FormField } from "@/shared/types/form-field";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { branchApi } from "../../adminBranch/api/admin-api";
import type { AccountFormData } from "../types/accounts-type";
import { rules } from "@/shared/util/rules";

export const accountsFormFields: FormField<AccountFormData>[] = [
    {
        key: "username",
        label: "Tên đăng nhập",
        placeholder: "Nhập tên đăng nhập",
        type: FormFieldTypes.INPUT,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập tên đăng nhập"
            }
        ]
    },
    {
        key: "password",
        label: "Mật khẩu",
        placeholder: "Nhập mật khẩu",
        type: FormFieldTypes.PASSWORD,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập mật khẩu"
            },
            rules.password
        ],
        hideInUpdateMode: true
    },
    {
        key: "full_name",
        label: "Họ và tên",
        placeholder: "Nhập họ và tên",
        type: FormFieldTypes.INPUT,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập họ và tên"
            }
        ]
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
            }
        ]
    },
    {
        key: "role",
        label: "Vai trò",
        placeholder: "Chọn vai trò",
        type: FormFieldTypes.SELECT,
        options: [
            { label: "Admin", value: "admin" },
            { label: "Manager", value: "manager" },
            { label: "Staff", value: "staff" },
        ],
        rules: [
            {
                required: true, 
                message: "Vui lòng chọn vai trò"
            }
        ]
    },
    {
        key: "status",
        label: "Trạng thái",
        placeholder: "Chọn trạng thái",
        type: FormFieldTypes.SELECT,
        options: [
            { label: "Hoạt động", value: "active" },
            { label: "Ngưng hoạt động", value: "inactive" },
        ],
        rules: [
            {
                required: true,
                message: "Vui lòng chọn trạng thái"
            }
        ]
    },
    {
        key: "branch_id",
        label: "Chi nhánh",
        placeholder: "Chọn chi nhánh",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getBranches,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id})),
        rules: [
            {
                required: true,
                message: "Vui lòng chọn chi nhánh"
            }
        ]
    }
]