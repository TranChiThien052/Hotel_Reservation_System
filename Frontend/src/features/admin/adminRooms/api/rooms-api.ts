import apiClient from "@/shared/lib/axios";
import type { RoomFormData } from "../types/rooms-type";

export const roomsApi = {
    getRoomsByBranchId: async (branchId: string) => {
        const res = await apiClient.get(`/rooms/branch/${branchId}`);
        return res.data;
    },
    getAllRooms: async () => {
        const res = await apiClient.get('/rooms');
        return res.data;
    },
    getRoomById: async (id: string) => {
        const res = await apiClient.get(`/rooms/${id}`);
        return res.data;
    },
    createRoom: async (roomData: RoomFormData) => {
        const res = await apiClient.post('/rooms', roomData);
        return res.data;
    },
    updateRoom: async (id: string, roomData: RoomFormData) => {
        const res = await apiClient.put(`/rooms/${id}`, roomData);
        return res.data;
    },
    deleteRoom: async (id: string) => {
        const res = await apiClient.delete(`/rooms/${id}`);
        return res.data;
    }
};