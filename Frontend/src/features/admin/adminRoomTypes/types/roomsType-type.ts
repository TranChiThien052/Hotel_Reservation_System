
export interface RoomImage {
    image_url:       string;
    image_public_id: string;
}
export interface RoomType {
    id: string;
    branch_id: string;
    name: string;
    description: string;
    max_guests: number;
    roomImages:RoomImage[];
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
    roomImages?: File[] | RoomImage[];
    is_active: boolean;
}