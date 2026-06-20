export interface ValidationRule {
    required?: boolean;
    pattern?: RegExp;
    validator?: (value: any, formValues?: any) => boolean; // Hàm tùy chỉnh để kiểm tra giá trị, trả về true nếu hợp lệ, hoặc thông báo lỗi nếu không hợp lệ
    message?: string; // Thông báo lỗi khi giá trị không hợp lệ
}