import apiClient from "@/shared/lib/axios";

export interface GetRoomsAvailableParams {
  branch_id: string;
  checkin: string;
  checkout: string;
  room_type_id?: string; 
}

export interface SearchRoomsAvailableParams {
  branch_id: string;
  checkin_at: string;
  checkout_at: string;
  room_type_id?: string;
  num_guests?: number;
  booking_type?: string;
}

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