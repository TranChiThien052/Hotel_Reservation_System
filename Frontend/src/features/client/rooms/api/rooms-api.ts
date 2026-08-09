import apiClient from "@/shared/lib/axios";
import type { GetRoomsAvailableParams, SearchRoomsAvailableParams } from "../types/roomsClient-type";



export const roomsAvailableApi = {
    getRoomsAvailable: async (params: GetRoomsAvailableParams) => {
        const res = await apiClient.get('/rooms-availability/available', {
            params: params,
        });
        return res.data;
    },
    searchRoomsAvailable: async (params: SearchRoomsAvailableParams) => {
        const res = await apiClient.get('/rooms-availability/search', {
            params: params,
        });
        return res.data;
    }
}   