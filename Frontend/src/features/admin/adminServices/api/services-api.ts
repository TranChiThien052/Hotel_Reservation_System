import apiClient from "@/shared/lib/axios";
import type { ServiceFormData } from "../types/services-type";

export const servicesApi = {
    getServicesByBranchId: async (branchId: string) => {
        const res = await apiClient.get(`/services/branch/${branchId}`);
        return res.data;
    },
    getAllServices: async () => {
        const res = await apiClient.get('/services');
        return res.data;
    },
    getServiceById: async (id: string) => {
        const res = await apiClient.get(`/services/${id}`);
        return res.data;
    },
    createService: async (serviceData: ServiceFormData) => {
        const res = await apiClient.post('/services', serviceData);
        return res.data;
    },
    updateService: async (id: string, serviceData: ServiceFormData) => {
        const res = await apiClient.put(`/services/${id}`, serviceData);
        return res.data;
    },
    deleteService: async (id: string) => {
        const res = await apiClient.delete(`/services/${id}`);
        return res.data;
    }
};