import apiClient from "@/shared/lib/axios"
import type { BranchFormData } from "../types/branch-type";

// Branch API calls
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
        const res = await apiClient.get('https://provinces.open-api.vn/api/v2/');
        return res.data;
    }
};

// // Room Type API calls
// export const getRoomTypes = async () => {
//     const res = await apiClient.get('/room-types');
//     return res.data;
// }

// export const getRoomTypeById = async (id: string) => {
//     const res = await apiClient.get(`/room-types/${id}`);
//     return res.data;
// }

// export const updateRoomType = async (roomTypeId: string, roomTypeData: RoomType) => {
//     const res = await apiClient.put(`/room-types/${roomTypeId}`, roomTypeData);
//     return res.data;
// }

// export const createRoomType = async (roomTypeData: RoomType) => {
//     const res = await apiClient.post('/room-types', roomTypeData);
//     return res.data;
// }