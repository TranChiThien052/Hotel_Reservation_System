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
    // status: 'unavailable' | 'available' | 'occupied' | 'cleaning' | 'maintenance'
    status: string;
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
    // status: 'unavailable' | 'available' | 'occupied' | 'cleaning' | 'maintenance'
    status: string;
}