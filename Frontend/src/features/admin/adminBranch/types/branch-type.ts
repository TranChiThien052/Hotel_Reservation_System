export interface Branch{
    id: string;
    name: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
    is_active: boolean;
}

export interface BranchFormData {
    name: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    description?: string;
    is_active: boolean;
} 