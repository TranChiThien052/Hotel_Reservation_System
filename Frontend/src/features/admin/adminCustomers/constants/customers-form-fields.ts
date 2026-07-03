import type { FormField } from "@/shared/types/form-field";
import type { Customer, CustomerFormData } from "../types/customers-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { rules } from "@/shared/util/rules";

export const customersFormFields: FormField<CustomerFormData>[] = [
    // {
    //     key: "account_id",
    //     label: "Account ID",
    //     placeholder: "Enter account ID",
    //     type: FormFieldTypes.INPUT,
    // },
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
            },
            rules.phone,
        ]
    },
    {
        key: "email",
        label: "Email",
        placeholder: "Nhập email",
        type: FormFieldTypes.INPUT,
        rules: [
            {   
                required: true,
                message: "Vui lòng nhập email"
            },
            rules.email,
        ]
    },
    {
        key: "id_card_number",
        label: "Số CMND/CCCD hoặc Passport",
        placeholder: "Nhập số CMND/CCCD hoặc Passport",
        type: FormFieldTypes.INPUT,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập số CMND/CCCD hoặc Passport"
            }
        ]
    },
    {
        key: "nationality",
        label: "Quốc tịch",
        placeholder: "Nhập quốc tịch",
        type: FormFieldTypes.INPUT,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập quốc tịch"
            }
        ]
    },
    {
        key: "date_of_birth",
        label: "Ngày sinh",
        placeholder: "Nhập ngày sinh",
        type: FormFieldTypes.DATE_PICKER,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập ngày sinh",
                
            },
            {
                validator: (formValues: Customer) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const birthDate = new Date(formValues.date_of_birth);
                    birthDate.setHours(0, 0, 0, 0);
                    return birthDate < today;
                },
                message: "Ngày sinh phải nhỏ hơn ngày hiện tại"
            }
        ]
    },
    {
        key: "address",
        label: "Địa chỉ",
        placeholder: "Nhập địa chỉ",
        type: FormFieldTypes.INPUT,
    }
]