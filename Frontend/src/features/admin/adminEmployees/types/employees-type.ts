export interface Employee {
    id: string;
    full_name: string;
    phone: string;
    account_id?: string;
    branch_id: string;
    position: string;
    created_at?: string;
    account?: {
        id: string;
        branch_id: string;
        status: string;
        username: string;
    };
    branches?: {
        id: string;
        name: string;
    };
}

export interface EmployeeFormData {
    full_name: string;
    phone: string;
    account_id?: string;
    branch_id: string;
    position: string;
    created_at?: string;
}