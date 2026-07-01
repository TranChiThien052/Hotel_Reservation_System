import type { FormField } from "@/shared/types/form-field";
import type { BookingFormData } from "../types/booking-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { branchApi } from "@/features/admin/adminBranch/api/admin-api";
import { customersApi } from "@/features/admin/adminCustomers/api/customers-api";
import { roomTypesApi } from "@/features/admin/adminRoomTypes/api/roomTypes-api";
import { promotionApi } from "@/features/admin/adminPromitions/api/promotion-api";
import { accountApi } from "@/features/admin/adminAccounts/api/accounts-api";

export const bookingFormFields: FormField<BookingFormData>[] = [
    {
        key: "branch_id",
        label: "Chi nhánh",
        placeholder: "Chọn chi nhánh",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: branchApi.getBranches,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id}))  
    },
    {
        key: "customer_id",
        label: "Khách hàng",
        placeholder: "Chọn khách hàng",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: customersApi.getAllCustomers,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id}))
    },
    {
        key: "room_type_id",
        label: "Loại phòng",
        placeholder: "Chọn loại phòng",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: roomTypesApi.getRoomTypes,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id}))
    },
    {
        key: "booking_type",
        label: "Loại đặt phòng",
        placeholder: "Chọn loại đặt phòng",
        type: FormFieldTypes.SELECT,
        options: [
            { label: "Theo giờ", value: "hourly" },
            { label: "Theo ngày", value: "daily" },
        ]
    },
    {   
        key: "status",
        label: "Trạng thái",
        placeholder: "Chọn trạng thái",
        type: FormFieldTypes.SELECT,
        options: [
            { label: "Đang chờ", value: "pending" },
            { label: "Đã xác nhận", value: "confirmed" },
            { label: "Đã hủy", value: "cancelled" },
            { label: "Đã hoàn tất", value: "completed" },
            { label: " Đã nhận phòng", value: "checked-in" },
            { label: "Đã trả phòng", value: "checked-out" },
        ]
    },
    {
        key: "checkin_at",
        label: "Ngày nhận phòng",
        placeholder: "Chọn ngày nhận phòng",
        type: FormFieldTypes.DATE_PICKER,
    },
    {
        key: "checkout_at",
        label: "Ngày trả phòng",
        placeholder: "Chọn ngày trả phòng",
        type: FormFieldTypes.DATE_PICKER,
    },
    {
        key: "num_guests",
        label: "Số lượng khách",
        placeholder: "Nhập số lượng khách",
        type: FormFieldTypes.NUMBER,
        rules: [
            {   
                required: true,
                message: "Vui lòng nhập số lượng khách"
            }
        
        ]
    },
    {
        key: "discount_id",
        label: "Mã giảm giá",
        placeholder: "Chọn mã giảm giá (nếu có)",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: promotionApi.getPromotions,
        customData: (data: any[]) => data.map((item) => ({label: item.code, value: item.id}))
    },
    {
        key: "created_by",
        label: "Người tạo",
        placeholder: "Chọn người tạo",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: accountApi.getAllAccounts,
        customData: (data: any[]) => data.map((item) => ({label: item.username, value: item.id})),
        rules: [
            {
                required: true,
                message: "Vui lòng chọn người tạo"
            }
        ]
    },
    {
        key: "notes",
        label: "Ghi chú",
        placeholder: "Nhập ghi chú (nếu có)",
        type: FormFieldTypes.TEXTAREA,
    }
];