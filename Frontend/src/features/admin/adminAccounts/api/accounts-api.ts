import apiClient from "@/shared/lib/axios"
import type { AccountCustomerFormData, AccountFormData } from "../types/accounts-type";

export const accountApi = {
    getAllAccounts: async () => {
        const res = await apiClient.get('/accounts');
        return res.data;
    },
    getAccountById: async (id: string) => {
        const res = await apiClient.get(`/accounts/${id}`);
        return res.data;
    },
    getAccountByUsername: async (username: string) => {
        const res = await apiClient.get(`/accounts/username/${username}`);
        return res.data;
    },
    createAccount: async (accountData: AccountFormData) => {
        const res = await apiClient.post('/accounts', accountData);
        return res.data;
    },
    updateAccount: async (id: string, accountData: AccountFormData) => {
        const res = await apiClient.put(`/accounts/${id}`, accountData);
        return res.data;
    },
    deleteAccount: async (id: string) => {
        const res = await apiClient.delete(`/accounts/${id}`);
        return res.data;
    },
    createStaffAccount: async (accountData: AccountFormData) => {
        const res = await apiClient.post('/accounts/register/staff', accountData);
        return res.data;
    },
    createCustomerAccount: async (accountData: AccountCustomerFormData) => {
        const res = await apiClient.post('/accounts/register/customer', accountData);
        return res.data;
    }
}