import apiClient from "@/shared/lib/axios";
import type { HolidayFormData } from "../types/holiday-types";

export const holidaysApi = {
    getAll: async () => {
        const res = await apiClient.get("/holiday-dates");
        return res.data;
    },
    create: async (values: HolidayFormData) => {
        const res = await apiClient.post("/holiday-dates", values);
        return res.data;
    },
    update: async (id: string, values: HolidayFormData) => {
        const res = await apiClient.put(`/holiday-dates/${id}`, values);
        return res.data;
    },
    getById: async (id: string) => {
        const res = await apiClient.get(`/holiday-dates/${id}`);
        return res.data;
    },
    delete: async (id: string) => {
        const res = await apiClient.delete(`/holiday-dates/${id}`);
        return res.data;
    }
}