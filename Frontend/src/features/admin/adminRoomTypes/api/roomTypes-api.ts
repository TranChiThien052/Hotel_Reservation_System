import apiClient from "../../../../shared/lib/axios"
import type { RoomType, RoomTypeFormData } from "../types/roomsType-type";



// // Room Type API calls
export const roomTypesApi = {
    getRoomTypes: async () => {
        const res = await apiClient.get('/room-types');
        return res.data;
    }
    ,
    getRoomTypeById: async (id: string) => {
        const res = await apiClient.get(`/room-types/${id}`);
        return res.data;
    },
    updateRoomType: async (id: string, roomTypeData: RoomTypeFormData) => {
        const res = await apiClient.put(`/room-types/${id}`, roomTypeData);
        return res.data;
    },
    createRoomType: async (roomTypeData: RoomTypeFormData) => {
        const res = await apiClient.post('/room-types', roomTypeData);
        return res.data;
    },
    deleteRoomType: async (id: string) => {
        const res = await apiClient.delete(`/room-types/${id}`);
        return res.data;
    }
};