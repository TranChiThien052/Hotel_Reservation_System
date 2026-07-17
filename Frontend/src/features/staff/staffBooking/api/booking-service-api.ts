import apiClient from "@/shared/lib/axios"

export const bookingServiceApi = {
    getByBookingId: async (bookingId: string) => {
        const res = await apiClient.get(`/booking-services/bookings/${bookingId}`);
        return res.data;
    },
    create: async (data: {
        booking_id: string;
        service_id: string;
        quantity: number;
        unit_price?: number;
        total_amount?: number;
        added_by?: string;
    }) => {
        const res = await apiClient.post('/booking-services', data);
        return res.data;
    },
    delete: async (id: string) => {
        const res = await apiClient.delete(`/booking-services/${id}`);
        return res.data;
    },
}
