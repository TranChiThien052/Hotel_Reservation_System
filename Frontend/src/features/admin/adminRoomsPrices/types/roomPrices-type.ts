export interface RoomPrice {
    id: string;
    room_type_id: string;
    room_types: {
        name: string;
    };
    price_per_night: number;
    price_per_hour: number;
    weekend_rate: number;
    holiday_rate: number;
    effective_from: string;
    effective_to: string;
}

export interface RoomPriceFormData {
    room_type_id: string;
    price_per_night: number;
    price_per_hour: number;
    weekend_rate: number;
    holiday_rate: number;
    effective_from: string;
    effective_to: string;
}