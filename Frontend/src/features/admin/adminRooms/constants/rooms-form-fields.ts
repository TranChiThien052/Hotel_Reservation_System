import type { FormField } from "@/shared/types/form-field";
import type { RoomFormData } from "../types/rooms-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { roomTypesApi } from "../../adminRoomTypes/api/roomTypes-api";
import { branchApi } from "../../adminBranch/api/admin-api";

export const roomsFormFields: FormField<RoomFormData>[] = [
    {
        key: "branch_id",
        label: "Branch",
        placeholder: "Select branch",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getBranches,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id}))
    },
    {
        key: "floor",
        label: "Floor",
        placeholder: "Enter floor number",
        type: FormFieldTypes.NUMBER,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập số tầng"
            }
        ]
    },
    {
        key: "room_number",
        label: "Room Number",
        placeholder: "Enter room number",
        type: FormFieldTypes.INPUT,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập số phòng"
            }
        ]
    },
    {
        key: "room_type_id",
        label: "Room Type",
        placeholder: "Select room type",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: roomTypesApi.getRoomTypes,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id}))
    },
    {
        key: "status",
        label: "Status",
        placeholder: "Select room status",
        type: FormFieldTypes.SELECT,
        options: [
            { label: "Unavailable", value: "unavailable" },
            { label: "Available", value: "available" },
            { label: "Occupied", value: "occupied" },
            { label: "Cleaning", value: "cleaning" },
            { label: "Maintenance", value: "maintenance" },
        ],
    },
    {
        key: "is_active",
        label: "Active",
        type: FormFieldTypes.SELECT,
        options: [
            { label: "Active", value: true },
            { label: "Inactive", value: false }
        ]
    },
    {
        key: "notes",
        label: "Notes",
        placeholder: "Enter any notes about the room",
        type: FormFieldTypes.TEXTAREA,
    },
    {
        key: "extra",
        label: "Extra Amenities",
        placeholder: "Enter extra amenities",
        type: FormFieldTypes.ARRAY_INPUT,
    },
    {
        key: "basic",
        label: "Basic Amenities",
        placeholder: "Enter basic amenities",
        type: FormFieldTypes.ARRAY_INPUT,
    }
]