export interface Promotion {
    id: string;
    code: string;
    description: string;
    discount_type: string;
    discount_value: number;
    is_active: boolean;
    branch_id: string;
    min_order_value: number;
    usage_limit: number;
    used_count: number;
    valid_from: string;
    valid_to: string;
    branches: {
        name: string;
    }
}

export interface PromotionFormData {
    code: string;
    description: string;
    discount_type: string;
    discount_value: number;
    is_active: boolean;
    branch_id: string;
    min_order_value: number;
    usage_limit: number;
    valid_from: string;
    valid_to: string;
}