import type { FormField } from "@/shared/types/form-field";
import type { PromotionFormData } from "../types/promotions-types";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { branchApi } from "../../adminBranch/api/admin-api";
import { disableStartDateNotPast } from "@/shared/util/validate-date";
import dayjs from 'dayjs';

export const promotionsFormFields: FormField<PromotionFormData>[] = [
    {
        key: "code",
        label: "Mã khuyến mãi",
        type: FormFieldTypes.INPUT,
        required: true,
        placeholder: "Nhập mã khuyến mãi"
    },
    {
        key: "description",
        label: "Mô tả",
        type: FormFieldTypes.TEXTAREA
    },
    {
        key: "discount_type",
        label: "Loại giảm giá",
        type: FormFieldTypes.SELECT,
        options: [
            { value: "percentage", label: "Percentage" },
            { value: "fixed", label: "Fixed Amount" }
        ]
    },
    {
        key: "discount_value",
        label: "Giá trị giảm giá",
        type: FormFieldTypes.NUMBER
    },
    {
        key: "is_active",
        label: "Is Active",
        type: FormFieldTypes.SELECT,
        options: [
            { value: true, label: "Active" },
            { value: false, label: "Inactive" }
        ]
    },
    {
        key: "branch_id",
        label: "Branch",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getBranches,
        customData: (data: any[]) => data.map((item) => ({ label: item.name, value: item.id }))
    },
    {
        key: "min_order_value",
        label: "Minimum Order Value",
        type: FormFieldTypes.NUMBER
    },
    {
        key: "usage_limit",
        label: "Usage Limit",
        type: FormFieldTypes.NUMBER
    },
    {
        key: "valid_from",
        label: "Valid From",
        type: FormFieldTypes.DATE_PICKER,
        componentProps: {
            disabledDate: (current: any, values: any) => {
                return disableStartDateNotPast(current, values?.valid_to ? dayjs(values.valid_to) : null)
            }
        }
    },
    {
        key: "valid_to",
        label: "Valid To",
        type: FormFieldTypes.DATE_PICKER,
        componentProps: {
            disabledDate: (current: any, values: any) => {
                return disableStartDateNotPast(current, values?.valid_to ? dayjs(values.valid_to) : null)
            }
        }
    }
];