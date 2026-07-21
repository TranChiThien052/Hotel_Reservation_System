import type { FormField } from "@/shared/types/form-field";
import type { HolidayFormData } from "../types/holiday-types";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { branchApi } from "../../adminBranch/api/admin-api";

export const holidayFormFields: FormField<HolidayFormData>[] = [
    {
        key: "branch_id",
        label: "Chi nhánh",
        required: true,
        placeholder: "Chọn chi nhánh",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getBranches,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id})),
        rules: [
            {
                required: true,
                message: "Vui lòng chọn chi nhánh",
            },
        ],
    },
    {
        key: "name",
        label: "Tên ngày lễ",
        required: true,
        placeholder: "Nhập tên ngày lễ",
        type: FormFieldTypes.INPUT,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập tên ngày lễ",
            },
        ],
    },
    {
        key: "date",
        label: "Ngày lễ",
        required: true,
        placeholder: "Chọn ngày lễ",
        type: FormFieldTypes.DATE,
        rules: [
            {
                required: true,
                message: "Vui lòng chọn ngày lễ",
            },
        ],
    },
]