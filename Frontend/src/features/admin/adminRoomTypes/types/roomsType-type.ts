export interface RoomType {
    id: string;
    branch_id: string;
    name: string;
    description: string;
    max_guests: number;
    images: String[];
    is_active: boolean;
    branches: {
        name: string;
    };
}

export interface RoomTypeFormData {
    branch_id: string;
    name: string;
    description?: string;
    max_guests: number;
    images?: String[];
    is_active: boolean;
}