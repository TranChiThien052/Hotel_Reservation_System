import type { Promotion, PromotionFormData } from "@/features/admin/adminPromitions/types/promotions-types";
import type { FormField } from "@/shared/types/form-field";
import { FormFieldTypes } from "@/shared/types/type-form-field";

export const managerDiscountFormFields: FormField<PromotionFormData>[] = [
    {
        key: "code",
        label: "Mã khuyến mãi",
        type: FormFieldTypes.INPUT,
        required: true,
        placeholder: "Nhập mã khuyến mãi",
        rules: [
          {
            required: true,
            message: "Vui lòng nhập mã khuyến mãi",
          },
        ],
      },
      {
        key: "description",
        label: "Mô tả",
        type: FormFieldTypes.TEXTAREA,
      },
      {
        key: "discount_type",
        label: "Loại giảm giá",
        type: FormFieldTypes.SELECT,
        options: [
          { value: "percentage", label: "Phần trăm" },
          { value: "fixed_amount", label: "Số tiền cố định" },
        ],
      },
      {
        key: "discount_value",
        label: "Giá trị giảm giá",
        type: FormFieldTypes.NUMBER,
        rules: [
          {
            required: true,
            message: "Vui lòng nhập giá trị giảm giá",
            // validator: (formValues: Promotion) => {
            //     if(formValues.discount_value <= 1000){
            //         return "Giá trị giảm giá phải lớn hơn 1000";
            //     }
            //     return true;
            // }
          },
        ],
      },
      {
        key: "is_active",
        label: "Trạng thái",
        type: FormFieldTypes.SELECT,
        options: [
          { value: true, label: "Khả dụng" },
          { value: false, label: "Không khả dụng" },
        ],
      },
      {
        key: "min_order_value",
        label: "Giá trị đơn hàng tối thiểu",
        placeholder: "Nhập giá trị đơn hàng tối thiểu",
        type: FormFieldTypes.NUMBER,
        rules: [
          {
            required: true,
            message: "Vui lòng nhập giá trị đơn hàng tối thiểu",
          },
        ],
      },
      {
        key: "usage_limit",
        label: "Giới hạn sử dụng",
        placeholder: "Nhập giới hạn sử dụng",
        type: FormFieldTypes.NUMBER,
        rules: [
          {
            required: true,
            message: "Vui lòng nhập giới hạn sử dụng",
          },
        ],
      },
      {
        key: "valid_from",
        label: "Ngày bắt đầu",
        placeholder: "Chọn ngày bắt đầu",
        type: FormFieldTypes.DATE_PICKER,
        rules: [
          {
            required: true,
            message: "Vui lòng chọn ngày bắt đầu",
            validator: (formValues: Promotion) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chỉ ngày
    
              const startDate = new Date(formValues.valid_from);
              startDate.setHours(0, 0, 0, 0); // Đặt giờ về 00:00:00 để so sánh chỉ ngày
    
              return (
                startDate >= today ||
                "Ngày bắt đầu phải lớn hơn hoặc bằng ngày hiện tại"
              );
            },
          },
        ],
      },
      {
        key: "valid_to",
        label: "Ngày kết thúc",
        placeholder: "Chọn ngày kết thúc",
        type: FormFieldTypes.DATE_PICKER,
        rules: [
          {
            required: true,
            validator: (formdata: Promotion) => {
              if (!formdata.valid_from || !formdata.valid_to) {
                return true;
              }
    
              const startDate = new Date(formdata.valid_from);
              const endDate = new Date(formdata.valid_to);
    
              return endDate > startDate;
            },
            message: "Ngày kết thúc phải lớn hơn ngày bắt đầu.",
          },
          {
            required: true,
            message: "Ngày kết thúc không được để trống.",
          },
        ],
      },
]