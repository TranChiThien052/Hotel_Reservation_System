import apiClient from "@/shared/lib/axios";

export interface Invoice {
    id: string;
    invoice_code: string;
    booking_id: string;
    issued_by?: string;
    room_charge: number;
    service_charge: number;
    fine_charge?: number;
    late_checkout_fee?: number;
    early_checkout_fee?: number;
    discount_amount: number;
    total_amount: number;
    deposit_used: number;
    amount_due: number;
    refund_amount?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface InvoiceCreateData {
    booking_id: string;
    issued_by?: string;
    notes?: string;
}

export const invoiceApi = {
    getAllInvoices: async (): Promise<Invoice[]> => {
        const res = await apiClient.get('/invoices');
        return res.data;
    },
    getInvoiceById: async (id: string): Promise<Invoice> => {
        const res = await apiClient.get(`/invoices/${id}`);
        return res.data;
    },
    getByBookingId: async (bookingId: string): Promise<Invoice[]> => {
        const res = await apiClient.get(`/invoices/booking/${bookingId}`);
        return res.data;
    },
    createInvoice: async (data: InvoiceCreateData): Promise<Invoice> => {
        const res = await apiClient.post('/invoices', data);
        return res.data;
    },
    updateInvoice: async (id: string, data: Partial<Invoice>) => {
        const res = await apiClient.put(`/invoices/${id}`, data);
        return res.data;
    },
    deleteInvoice: async (id: string) => {
        const res = await apiClient.delete(`/invoices/${id}`);
        return res.data;
    },
};
