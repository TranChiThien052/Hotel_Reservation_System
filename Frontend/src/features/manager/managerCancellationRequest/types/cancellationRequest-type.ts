import type { Booking } from "@/features/staff/staffBooking/types/booking-type";

export interface CancellationRequestType {
    id: string;
    booking_id: string,
    requested_by: string,
    reason: string,
    status: string,
    refund_amount: number,
    refund_processed_at?: string,
    resolved_by?: string,
    notes: string,
    created_at: string,
    updated_at: string,
    bookings: Booking
}