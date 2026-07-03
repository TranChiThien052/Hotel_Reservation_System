import apiClient from "../../../../shared/lib/axios";
import type { RoomTypeFormData } from "../types/roomsType-type";

// // Room Type API calls
export const roomTypesApi = {
  getRoomTypes: async () => {
    const res = await apiClient.get("/room-types");
    return res.data;
  },
  getRoomTypeById: async (id: string) => {
    const res = await apiClient.get(`/room-types/${id}`);
    return res.data;
  },
  updateRoomType: async (id: string, roomTypeData: RoomTypeFormData) => {
    const res = await apiClient.put(`/room-types/${id}`, roomTypeData);
    return res.data;
  },
  createRoomType: async (roomTypeData: RoomTypeFormData) => {
    const formData = new FormData();
    // Append các field text
    formData.append("branch_id", roomTypeData.branch_id);
    formData.append("name", roomTypeData.name);
    formData.append("description", roomTypeData.description ?? "");
    formData.append("max_guests", String(roomTypeData.max_guests));
    formData.append("is_active", String(roomTypeData.is_active));
    // Append từng file ảnh, tên field phải là "images" (khớp với backend)
    if (roomTypeData.roomImages && roomTypeData.roomImages.length > 0) {
      roomTypeData.roomImages.forEach((file) => {
        formData.append("images", file); // ← "images" khớp với upload.array("images", 5)
      });
    }
    const res = await apiClient.post("/room-types", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // ← PHẢI có header này
      },
    });
    return res.data;
  },
  deleteRoomType: async (id: string) => {
    const res = await apiClient.delete(`/room-types/${id}`);
    return res.data;
  },
};
