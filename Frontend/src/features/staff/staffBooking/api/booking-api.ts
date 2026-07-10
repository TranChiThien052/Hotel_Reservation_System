import apiClient from "@/shared/lib/axios"
import type { BookingFormData } from "../types/booking-type";

export const bookingApi = {
    getAllBooking: async () => {
        const res = await apiClient.get('/bookings');
        return res.data;
    },
    getBookingById: async (id: string) => {
        const res = await apiClient.get(`/bookings/${id}`);
        return res.data;
    },
    createBooking: async (bookingData: BookingFormData) => {
        const res = await apiClient.post('/bookings', bookingData);
        return res.data;
    },
    updateBooking: async (id: string, bookingData: BookingFormData) => {
        const res = await apiClient.put(`/bookings/${id}`, bookingData);
        return res.data;
    },
    deleteBooking: async (id: string) => {
        const res = await apiClient.delete(`/bookings/${id}`);
        return res.data;
    },
    getBookingsByBranchId: async (branchId: string) => {
        const res = await apiClient.get(`/bookings/branch/${branchId}`);
        return res.data;
    }
}