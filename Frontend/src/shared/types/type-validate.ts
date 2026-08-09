export interface ValidationRule {
    required?: boolean;
    pattern?: RegExp;
    validator?: (value: any, formValues?: any) => boolean;
    message?: string; 
}