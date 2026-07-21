import apiClient from "@/shared/lib/axios"

export const historyTransactionApi = {
  getAll: async () => {
    const res = await apiClient.get("/history-transactions");
    return res.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/history-transactions/${id}`);
    return res.data;
  },
  getByAccountId: async (id: string) => {
    const res = await apiClient.get(`/history-transactions/account/${id}`);
    return res.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post("/history-transactions", data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/history-transactions/${id}`);
    return res.data;
  },
  getByBranchId: async (branchId: string) => {
    const res = await apiClient.get(`/history-transactions/branch/${branchId}`);
    return res.data;
  }
}