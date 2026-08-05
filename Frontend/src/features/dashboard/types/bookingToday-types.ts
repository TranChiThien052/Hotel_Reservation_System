import type { Booking } from "@/features/staff/staffBooking/types/booking-type";

export interface BookingToday {
  checkins: Booking[];
  checkouts: Booking[];
  checkinsCount: number;
  checkoutsCount: number;
  revenue: {
    actual_revenue: number;
    bank_transfer_revenue: number;
    cash_revenue: number;
    deposit_revenue: number;
  };
}