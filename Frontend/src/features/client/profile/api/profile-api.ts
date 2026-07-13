import apiClient from "@/shared/lib/axios";

export interface CancellationRequestPayload {
    booking_id: string;
    requested_by?: string;
    reason: string;
    refund_amount?: number;
    notes?: string;
}

export const cancellationApi = {
    createCancellationRequest: async (data: CancellationRequestPayload) => {
        const res = await apiClient.post('/cancellation-requests', data);
        return res.data;
    },

    getByBookingId: async (bookingId: string) => {
        // Lấy tất cả và filter theo booking_id
        const res = await apiClient.get('/cancellation-requests');
        const all = Array.isArray(res.data) ? res.data : [];
        return all.filter((r: any) => r.booking_id === bookingId);
    },
};
