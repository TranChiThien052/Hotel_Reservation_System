export interface Room{
    id: string;
    branch_id: string;
    room_type_id: string;
    room_number: string;
    floor: number;
    is_active: boolean;
    notes?: string;
    extra?: string[];
    basic: string[];
    status: string;
    branches: {
        name: string;
    };
    room_types: {
        name: string;
    };
}

export interface RoomFormData {
    branch_id: string;
    room_type_id: string;
    room_number: string;
    floor: number;
    is_active: boolean;
    notes?: string;
    extra?: string[];
    basic: string[];
    status: string;
}