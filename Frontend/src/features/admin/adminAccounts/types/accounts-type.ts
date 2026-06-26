import type { UserRole } from "./user-role-type";

export interface Account {
    id: string;
    username: string;
    password: string;
    role: UserRole;
    status: string;
    branch_id: string;
    branches: {
        id: string;
        name: string;
    };
    staff?: {
        id: string;
        full_name: string;
        phone: string;
    };
    customers?: {
        id: string;
        full_name: string;
        phone: string;
    };
}

export interface AccountFormData {
    username: string;
    password?: string;
    full_name: string;
    phone: string;
    role: UserRole;
    status: string;
    branch_id: string;
}