import type { FormField } from "@/shared/types/form-field";
import type { Service, ServiceFormData } from "../types/services-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { branchApi } from "../../adminBranch/api/admin-api";

export const servicesFormFields: FormField<ServiceFormData>[] = [
    {
        key: "name",
        label: "Tên dịch vụ",
        placeholder: "Nhập tên dịch vụ",
        type: FormFieldTypes.INPUT,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập tên dịch vụ"
            }
        ]
    },
    {
        key: "description",
        label: "Mô tả",
        placeholder: "Nhập mô tả dịch vụ",
        type: FormFieldTypes.TEXTAREA,
    },
    {
        key: "price",
        label: "Giá",
        placeholder: "Nhập giá dịch vụ",
        type: FormFieldTypes.NUMBER,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập giá dịch vụ",
                
            },
            {
                message: "Giá dịch vụ phải lớn hơn 1000 VND",
                validator: (formValues: Service) => {
                    return formValues.price > 1000;
                }
            }
        ]
    },
    {
        key: "unit",
        label: "Đơn vị",
        placeholder: "Nhập đơn vị tính (ví dụ: cái, suất,...)",
        type: FormFieldTypes.INPUT,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập đơn vị tính"
            }
        ]
    },
    {
        key: "is_active",
        label: "Trạng thái",
        type: FormFieldTypes.SELECT,
        options: [
            { value: true, label: "Hoạt động" },
            { value: false, label: "Không hoạt động" }
        ]
    },
    {
        key: "branch_id",
        label: "Chi nhánh",
        placeholder: "Chọn chi nhánh cung cấp dịch vụ",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getBranches,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id})),
        rules: [
            {
                required: true,
                message: "Vui lòng chọn chi nhánh cung cấp dịch vụ"
            }
        ]
    }
];
