import apiClient from "@/shared/lib/axios";

export const cancellationRequestApi = {
    getAll: async () => {
        const res = await apiClient.get("/cancellation-requests");
        return res.data;
    },
    getById: async (id: string) => {
        const res = await apiClient.get(`/cancellation-requests/${id}`);
        return res.data;
    },
    create: async (data: any) => {
        const res = await apiClient.post("/cancellation-requests", data);
        return res.data;
    },
    update: async (id: string, data: any) => {
        const res = await apiClient.put(`/cancellation-requests/${id}`, data);
        return res.data;
    },
    delete: async (id: string) => {
        const res = await apiClient.delete(`/cancellation-requests/${id}`);
        return res.data;
    }
}
