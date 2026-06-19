import type { FormField } from "@/shared/types/form-field";
import type { RoomTypeFormData } from "../types/roomsType-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { branchApi } from "../../adminBranch/api/admin-api";

export const roomTypeFormFields: FormField<RoomTypeFormData>[] = [
    {
        key: "branch_id",
        label: "Branch ID",
        placeholder: "Enter branch ID",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getBranches,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id})),
    },
    {
        key: "name",
        label: "Room Type Name",
        placeholder: "Enter room type name",
        type: FormFieldTypes.INPUT,
    },
    {
        key: "description",
        label: "Description",
        placeholder: "Enter description",
        type: FormFieldTypes.TEXTAREA,
    },
    {
        key: "max_guests",
        label: "Max Guests",
        placeholder: "Enter maximum number of guests",
        type: FormFieldTypes.NUMBER,
    },
    {
        key: "is_active",
        label: "Status",
        type: FormFieldTypes.SELECT,
        options: [
            { label: "Active", value: true },
            { label: "Inactive", value: false }
        ]
    },
    {
        key: "images",
        label: "Room Images",
        placeholder: "Upload room images",
        type: FormFieldTypes.IMAGE_UPLOAD,
     }
]