import type { AccountFormData } from "@/features/admin/adminAccounts/types/accounts-type";
import type { FormField } from "@/shared/types/form-field";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { rules } from "@/shared/util/rules";

export const staffAccountsFormFields: FormField<AccountFormData>[] = [
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
            ],
            hideInUpdateMode: true,
            componentProps: { autoComplete: "new-password" }
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
            componentProps: { autoComplete: "new-password" }
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
            ],
            // hideInUpdateMode: true
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
            ],
            hideInUpdateMode: true
        },
        {
            key: "role",
            label: "Vai trò",
            placeholder: "Chọn vai trò",
            type: FormFieldTypes.SELECT,
            options: [
                { label: "Nhân viên", value: "staff" }
            ],
            rules: [
                {
                    required: true, 
                    message: "Vui lòng chọn vai trò"
                }
            ],
            hideInUpdateMode: true
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
        }
]