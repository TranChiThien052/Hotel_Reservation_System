import apiClient from "@/shared/lib/axios";
import type { Invoice, InvoiceCreateData } from "../types/invoice-type";



export const invoiceApi = {
    getAllInvoices: async () => {
        const res = await apiClient.get('/invoices');
        return res.data;
    },
    getInvoiceById: async (id: string) => {
        const res = await apiClient.get(`/invoices/${id}`);
        return res.data;
    },
    getByBookingId: async (bookingId: string) => {
        const res = await apiClient.get(`/invoices/booking/${bookingId}`);
        return res.data;
    },
    createInvoice: async (data: InvoiceCreateData) => {
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
    calculateInvoice: async (bookingId: string) => {
        const res = await apiClient.get(`/invoices/calculate/${bookingId}`);
        return res.data;
    }
};
