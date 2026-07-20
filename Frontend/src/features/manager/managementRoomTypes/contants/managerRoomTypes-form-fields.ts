import type { RoomTypeFormData } from "@/features/admin/adminRoomTypes/types/roomsType-type";
import type { FormField } from "@/shared/types/form-field";
import { FormFieldTypes } from "@/shared/types/type-form-field";

export const managerRoomTypesFormFields: FormField<RoomTypeFormData>[] = [
  {
    key: "name",
    label: "Tên loại phòng",
    placeholder: "Nhập tên loại phòng",
    type: FormFieldTypes.INPUT,
    rules: [
      {
        required: true,
        message: "Vui lòng nhập tên loại phòng",
      },
    ],
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
        message: "Vui lòng nhập số lượng khách tối đa",
      },
    ],
  },
  {
    key: "is_active",
    label: "Trạng thái",
    type: FormFieldTypes.SELECT,
    options: [
      { label: "Hoạt động", value: true },
      { label: "Ngừng hoạt động", value: false },
    ],
  },
  {
    key: "roomImages",
    label: "Hình ảnh phòng",
    placeholder: "Tải lên hình ảnh phòng",
    type: FormFieldTypes.IMAGE_UPLOAD,
  },
];
