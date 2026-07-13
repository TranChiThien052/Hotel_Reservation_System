export interface Booking {
    id: string,
    booking_code: string,
    branch_id: string,
    customer_id: string,
    room_type_id: string,
    assigned_room_id: string,
    booking_type: string,
    status: string,
    checkin_at: string,
    checkout_at: string,
    actual_checkin_at?: string,
    actual_checkout_at?: string,
    num_guests: number,
    room_price_snapshot: string,
    discount_id?: string,
    discount_amount?: string,
    subtotal: string,
    total_amount: string,
    deposit_amount: string,
    deposit_paid_at?: string,
    expires_at: string,
    created_by: string,
    notes?: string,
    created_at: string,
    updated_at: string
    customers?: {
        account_id: string,
        address: string,
        created_at: string,
        date_of_birth: string,
        email: string,
        full_name: string,
        id: string,
        id_card_number: string,
        nationality: string,
        phone: string,
    }
    branches?: {
        name: string,
    }
    room_types?: {
        id: string,
        name: string,
    }
}

export interface BookingFormData {
    branch_id: string,
    customer_id: string,
    room_type_id: string,
    booking_type: string,
    status: string,
    checkin_at: string,
    checkout_at: string,
    num_guests: number,
    discount_id?: string,
    created_by: string,
    notes?: string
}
