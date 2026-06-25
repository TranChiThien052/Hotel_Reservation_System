import apiClient from "@/shared/lib/axios"
import type { CustomerFormData } from "../types/customers-type";

export const customersApi = {
    getAllCustomers: async () => {
        const res = await apiClient.get('/customers');
        return res.data;
    },
    getCustomerById: async (id: string) => {
        const res = await apiClient.get(`/customers/${id}`);
        return res.data;
    },
    createCustomer: async (customerData: CustomerFormData) => {
        const res = await apiClient.post('/customers', customerData);
        return res.data;
    },
    updateCustomer: async (id: string, customerData: CustomerFormData) => {
        const res = await apiClient.put(`/customers/${id}`, customerData);
        return res.data;
    },
    deleteCustomer: async (id: string) => {
        const res = await apiClient.delete(`/customers/${id}`);
        return res.data;
    }
};