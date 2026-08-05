import apiClient from "../../../../shared/lib/axios";
import type { RoomTypeFormData } from "../types/roomsType-type";

export const roomTypesApi = {
  getRoomTypes: async () => {
    const res = await apiClient.get("/room-types");
    return res.data;
  },
  getRoomTypeById: async (id: string) => {
    const res = await apiClient.get(`/room-types/${id}`);
    return res.data;
  },
  updateRoomType: async (
    id: string,
    roomTypeData: Omit<RoomTypeFormData, "roomImages">,
  ) => {
    const res = await apiClient.put(`/room-types/${id}`, roomTypeData);
    return res.data;
  },
  createRoomType: async (roomTypeData: RoomTypeFormData) => {
    const formData = new FormData();

    formData.append("branch_id", roomTypeData.branch_id);
    formData.append("name", roomTypeData.name);
    formData.append("description", roomTypeData.description ?? "");
    formData.append("max_guests", String(roomTypeData.max_guests));
    formData.append("is_active", String(roomTypeData.is_active));

    if (roomTypeData.roomImages && roomTypeData.roomImages.length > 0) {
      roomTypeData.roomImages.forEach((file) => {
        if (file instanceof File) {
          formData.append("images", file);
        }
      });
    }
    const res = await apiClient.post("/room-types", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },
  addRoomTypeImage: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });
    const res = await apiClient.post(`/room-types/images/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  deleteRoomTypeImage: async (img_url: string, public_id: string) => {
    const res = await apiClient.delete("/room-types/images", {
      data: { img_url, public_id },
    });
    return res.data;
  },
  getRoomTypeByBranchId: async (branch_id: string) => {
    const res = await apiClient.get(`/room-types/branch/${branch_id}`);
    return res.data;
  },
  deleteRoomType: async (id: string) => {
    const res = await apiClient.delete(`/room-types/${id}`);
    return res.data;
  },
};
