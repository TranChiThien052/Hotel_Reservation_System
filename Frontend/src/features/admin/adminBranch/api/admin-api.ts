import apiClient from "@/shared/lib/axios"
import type { BranchFormData } from "../types/branch-type";


export const branchApi = {
    getBranches: async () => {
        const res = await apiClient.get('/branches');
        return res.data;
    },
    getBranchById: async (id: string) => {
        const res = await apiClient.get(`/branches/${id}`);
        return res.data;
    },
        updateBranch: async (branchId: string, branchData: BranchFormData) => {
        const res = await apiClient.put(`/branches/${branchId}`, branchData);
        return res.data;
    },
    createBranch: async (branchData: BranchFormData) => {
        const res = await apiClient.post('/branches', branchData);
        return res.data;
    },
    deleteBranch: async (id: string) => {
        const res = await apiClient.delete(`/branches/${id}`);
        return res.data;
    },
    getCityOptions: async () => {
        const res = await apiClient.get('/branches/provinces');
        return res.data;
    }
};
