import type { Room, RoomFormData } from "@/features/admin/adminRooms/types/rooms-type";
import { roomTypesApi } from "@/features/admin/adminRoomTypes/api/roomTypes-api";
import type { FormField } from "@/shared/types/form-field";
import { FormFieldTypes } from "@/shared/types/type-form-field";

import { store } from "@/app/store/store";

export const managerRoomTypesFormFields: FormField<RoomFormData>[] = [
    {
            key: "floor",
            label: "Số tầng",
            placeholder: "Nhập số tầng",
            type: FormFieldTypes.NUMBER,
            rules: [
                {
                    required: true,
                    message: "Vui lòng nhập số tầng"
                },
                {
                    validator: (formValues: Room) => {
                        const floor = formValues.floor;
                        return floor >= 1 && floor <= 9;
                },
                message: "Số tầng phải nằm trong khoảng từ 1 đến 9"
            }
            ]
        },
        {
            key: "room_number",
            label: "Số phòng",
            placeholder: "Nhập số phòng",
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
            label: "Loại phòng",
            placeholder: "Chọn loại phòng",
            type: FormFieldTypes.SELECT_FETCH,
            fetchOptions: () => {
                const branchId = store.getState().auth.user?.branch_id || "";
                return roomTypesApi.getRoomTypeByBranchId(branchId);
            },
            customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id})),
            rules: [
                {
                    required: true,
                    message: "Vui lòng chọn loại phòng"
                }
            ]
        },
        {
            key: "status",
            label: "Trạng thái",
            placeholder: "Chọn trạng thái phòng",
            type: FormFieldTypes.SELECT,
            options: [
                { label: "Không khả dụng", value: "unavailable" },
                { label: "Khả dụng", value: "available" },
                { label: "Đang sử dụng", value: "occupied" },
                { label: "Đang dọn dẹp", value: "cleaning" },
                { label: "Đang bảo trì", value: "maintenance" },
            ],
            rules: [
                {
                    required: true,
                    message: "Vui lòng chọn trạng thái phòng"
                }
            ]
        },
        {
            key: "is_active",
            label: "Trạng thái hoạt động",
            type: FormFieldTypes.SELECT,
            options: [
                { label: "Hoạt động", value: true },
                { label: "Ngừng hoạt động", value: false }
            ],
            rules: [
                {
                    required: true,
                    message: "Vui lòng chọn trạng thái hoạt động"
                }
            ]
        },
        {
            key: "notes",
            label: "Ghi chú",
            placeholder: "Nhập bất kỳ ghi chú nào về phòng",
            type: FormFieldTypes.TEXTAREA,
        },
        {
            key: "extra",
            label: "Tiện nghi bổ sung",
            placeholder: "Nhập tiện nghi bổ sung",
            type: FormFieldTypes.ARRAY_INPUT,
        },
        {
            key: "basic",
            label: "Tiện nghi cơ bản",
            placeholder: "Nhập tiện nghi cơ bản",
            type: FormFieldTypes.ARRAY_INPUT,
        }
]