import apiClient from "../../../shared/lib/axios"

export const getBranches = async () => {
    const res = await apiClient.get('/branches');
    return res.data;
}

export const getBranchById = async (id: string) => {
    const res = await apiClient.get(`/branches/${id}`);
    return res.data;
}

export const updateBranch = async (branchId: string, branchData: any) => {
    const res = await apiClient.put(`/branches/${branchId}`, branchData);
    return res.data;
}

export const createBranch = async (branchData: any) => {
    const res = await apiClient.post('/branches', branchData);
    return res.data;
}