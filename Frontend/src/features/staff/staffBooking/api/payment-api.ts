import apiClient from "@/shared/lib/axios";

export interface PaymentData {
    booking_id: string;
    invoice_id?: string;
    payment_method: string;
    status?: string;
    amount: number;
    is_deposit: boolean;
    transaction_ref?: string;
    processed_by?: string;
    notes?: string;
}

export interface Payment {
    id: string;
    booking_id: string;
    invoice_id?: string;
    payment_method: string;
    status: string;
    amount: number;
    is_deposit: boolean;
    paid_at?: string;
    transaction_ref?: string;
    processed_by?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ZaloPayResultParams {
    appid: number;
    checksum: string;
    apptransid: string;
    pmcid: string;
    bankcode: string;
    amount: number;
    discountamount: number;
    status: string;
}

export const paymentApi = {
    getAllPayments: async () => {
        const res = await apiClient.get('/payments');
        return res.data;
    },
    getPaymentById: async (id: string) => {
        const res = await apiClient.get(`/payments/${id}`);
        return res.data;
    },
    getPaymentsByBookingId: async (bookingId: string): Promise<Payment[]> => {
        const res = await apiClient.get(`/payments/booking/${bookingId}`);
        return res.data;
    },
    getPaymentsByInvoiceId: async (invoiceId: string): Promise<Payment[]> => {
        const res = await apiClient.get(`/payments/invoice/${invoiceId}`);
        return res.data;
    },
    createPayment: async (data: PaymentData): Promise<Payment> => {
        const res = await apiClient.post('/payments', data);
        return res.data;
    },
    updatePayment: async (id: string, data: Partial<PaymentData & { paid_at?: string; status?: string }>) => {
        const res = await apiClient.put(`/payments/${id}`, data);
        return res.data;
    },
    createZalopayPayment: async (data: {
        booking_id: string;
        booking_code: string;
        amount: number;
        is_deposit: boolean;
    }) => {
        const res = await apiClient.post('/payments/zalopay/create', data);
        return res.data;
    },
    getZaloPayPaymentResult: async (params: ZaloPayResultParams) => {
        const res = await apiClient.get('/payments/zalopay/payment_result', { params });
        return res.data;
    },
};
