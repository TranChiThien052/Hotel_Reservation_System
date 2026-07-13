import apiClient from "@/shared/lib/axios";

export interface GetRoomsAvailableParams {
  branch_id: string;
  checkin_at: string;
  checkout_at: string;
  room_type_id?: string; 
}

export const roomsAvailableApi = {
    getRoomsAvailable: async (params: GetRoomsAvailableParams) => {
        const res = await apiClient.get('/rooms-availability/available', {
            params: params,
        });
        return res.data;
    }
}   