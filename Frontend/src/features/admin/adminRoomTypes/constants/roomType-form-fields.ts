import type { FormField } from "@/shared/types/form-field";
import type { RoomTypeFormData } from "../types/roomsType-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { branchApi } from "../../adminBranch/api/admin-api";

export const roomTypeFormFields: FormField<RoomTypeFormData>[] = [
    {
        key: "branch_id",
        label: "Chi nhánh",
        placeholder: "Chọn chi nhánh",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getBranches,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id})),
    },
    {
        key: "name",
        label: "Tên loại phòng",
        placeholder: "Nhập tên loại phòng",
        type: FormFieldTypes.INPUT,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập tên loại phòng"
            }
        ]
    },
    {
        key: "description",
        label: "Mô tả",
        placeholder: "Nhập mô tả",
        type: FormFieldTypes.TEXTAREA,
    },
    {
        key: "max_guests",
        label: "Số lượng khách tối đa",
        placeholder: "Nhập số lượng khách tối đa",
        type: FormFieldTypes.NUMBER,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập số lượng khách tối đa"
            }
        ]
    },
    {
        key: "is_active",
        label: "Trạng thái",
        type: FormFieldTypes.SELECT,
        options: [
            { label: "Hoạt động", value: true },
            { label: "Ngừng hoạt động", value: false }
        ]
    },
    {
        key: "roomImages",
        label: "Hình ảnh phòng",
        placeholder: "Tải lên hình ảnh phòng",
        type: FormFieldTypes.IMAGE_UPLOAD,
     }
]