import apiClient from "@/shared/lib/axios";
import type { RoomPriceFormData } from "../types/roomPrices-type";

export const roomPricesApi = {
    getRoomPricesByBranchId: async (branchId: string) => {
        const res = await apiClient.get(`/room-prices/branch/${branchId}`);
        return res.data;
    },
    getAllRoomprices: async () => {
        const res = await apiClient.get('/room-prices');
        return res.data;
    },
    getRoomPriceById: async (id: string) => {
        const res = await apiClient.get(`/room-prices/${id}`);
        return res.data;
    },
    createRoomPrice: async (roomPriceData: RoomPriceFormData) => {
        const res = await apiClient.post('/room-prices', roomPriceData);
        return res.data;
    },
    updateRoomPrice: async (id: string, roomPriceData: RoomPriceFormData) => {
        const res = await apiClient.put(`/room-prices/${id}`, roomPriceData);
        return res.data;
    },
    deleteRoomPrice: async (id: string) => {
        const res = await apiClient.delete(`/room-prices/${id}`);
        return res.data;
    }
};