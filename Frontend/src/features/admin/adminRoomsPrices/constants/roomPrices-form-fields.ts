import type { FormField } from "@/shared/types/form-field";
import type { RoomPrice, RoomPriceFormData } from "../types/roomPrices-type";
import { FormFieldTypes } from "@/shared/types/type-form-field";
import { roomTypesApi } from "../../adminRoomTypes/api/roomTypes-api";
import { disableEndDateNotPast, disableStartDateNotPast } from "@/shared/util/validate-date";
import dayjs from 'dayjs';

export const roomPricesFormFields: FormField<RoomPriceFormData>[] = [
    {
        key: "room_type_id",
        label: "Loại phòng",
        placeholder: "Chọn loại phòng",
        type: FormFieldTypes.SELECT_FETCH,
        fetchOptions: roomTypesApi.getRoomTypes,
        customData: (data: any[]) => data.map((item) => ({label: item.name, value: item.id}))
    },
    {
        key: "price_per_day",
        label: "Giá theo ngày",
        placeholder: "Nhập giá theo ngày",
        type: FormFieldTypes.NUMBER,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập giá theo ngày",
                
            },
            {
                message: "Giá theo ngày phải lớn hơn 1000 VND",
                validator: (formValues: RoomPrice) => {
                    return formValues.price_per_day > 1000;
                }
            }
        ]
    },
    {
        key: "price_per_hour",
        label: "Giá theo giờ",
        placeholder: "Nhập giá theo giờ",
        type: FormFieldTypes.NUMBER,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập giá theo giờ"
            },
            {
                message: "Giá theo giờ phải lớn hơn 1000 VND",
                validator: (formValues: RoomPrice) => {
                    return formValues.price_per_hour > 1000;
                }
            }
        ]
    },
    {
        key: "weekend_rate",
        label: "Tỷ lệ cuối tuần (%)",
        placeholder: "Nhập tỷ lệ giá cuối tuần",
        type: FormFieldTypes.NUMBER,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập tỷ lệ giá cuối tuần"
            }
        ]
    },
    {
        key: "holiday_rate",
        label: "Tỷ lệ ngày lễ (%)",
        placeholder: "Nhập tỷ lệ giá ngày lễ",
        type: FormFieldTypes.NUMBER,
        rules: [
            {
                required: true,
                message: "Vui lòng nhập tỷ lệ giá ngày lễ"
            }
        ]
    },
    {
        key: "effective_from",
        label: "Hiệu lực từ",
        placeholder: "Chọn ngày hiệu lực từ",
        type: FormFieldTypes.DATE_PICKER,
        rules: [
            {
                required: true,
                message: "Vui lòng chọn ngày hiệu lực",
                validator: (formValues: RoomPrice) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chỉ ngày

                    const startDate = new Date(formValues.effective_from);
                    startDate.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chỉ ngày

                    return startDate >= today || "Ngày hiệu lực phải lớn hơn hoặc bằng ngày hiện tại";
                }
            }
        ]
    },
    {
        key: "effective_to",
        label: "Hiệu lực đến",
        placeholder: "Chọn ngày hiệu lực đến",
        type: FormFieldTypes.DATE_PICKER,
        rules: [
            {
                required: true,
                validator: (formdata: RoomPrice) => {
                    if (!formdata.effective_from || !formdata.effective_to) {
                        return true;
                    }
                    const startDate = new Date(formdata.effective_from);
                    const endDate = new Date(formdata.effective_to);
                    return endDate > startDate || "Ngày hết hiệu lực đến phải lớn hơn ngày bắt đầu hiệu lực";
                }
            }
        ]
    }
]