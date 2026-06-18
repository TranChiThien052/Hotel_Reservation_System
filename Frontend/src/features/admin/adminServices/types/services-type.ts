export interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
    branch_id: string;
    is_active: boolean;
    unit: string;
    booking_services: string;
}

export interface ServiceFormData {
    name: string;
    description: string;
    price: number;
    branch_id: string;
    is_active: boolean;
    unit: string;
}