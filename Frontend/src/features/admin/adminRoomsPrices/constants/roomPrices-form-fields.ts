import type { FormField } from "@/shared/types/form-field";
import type { RoomPriceFormData } from "../types/roomPrices-type";
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
    },
    {
        key: "price_per_hour",
        label: "Giá theo giờ",
        placeholder: "Nhập giá theo giờ",
        type: FormFieldTypes.NUMBER,
    },
    {
        key: "weekend_rate",
        label: "Tỷ lệ cuối tuần (%)",
        placeholder: "Nhập tỷ lệ giá cuối tuần",
        type: FormFieldTypes.NUMBER,
    },
    {
        key: "holiday_rate",
        label: "Tỷ lệ ngày lễ (%)",
        placeholder: "Nhập tỷ lệ giá ngày lễ",
        type: FormFieldTypes.NUMBER,
    },
    {
        key: "effective_from",
        label: "Hiệu lực từ",
        placeholder: "Chọn ngày hiệu lực từ",
        type: FormFieldTypes.DATE_PICKER,
        componentProps: {
          disabledDate: (current: any, values: any) => {
            return disableStartDateNotPast(current, values?.effective_to ? dayjs(values.effective_to) : null)
          }
        }
    },
    {
        key: "effective_to",
        label: "Hiệu lực đến",
        placeholder: "Chọn ngày hiệu lực đến",
        type: FormFieldTypes.DATE_PICKER,
        componentProps: {
          disabledDate: (current: any, values: any) => {
            return disableEndDateNotPast(current, values?.effective_from ? dayjs(values.effective_from) : null)
          }
        }
    }
]