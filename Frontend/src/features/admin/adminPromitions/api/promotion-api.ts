import apiClient from "@/shared/lib/axios";
import type { PromotionFormData } from "../types/promotions-types";

export const promotionApi = {
    getPromotions: async () => {
        const res = await apiClient.get('/discounts');
        return res.data;
    },
    getPromotionById: async (id: string) => {
        const res = await apiClient.get(`/discounts/${id}`);
        return res.data;
    },
    updatePromotion: async (promotionId: string, promotionData: PromotionFormData) => {
        const res = await apiClient.put(`/discounts/${promotionId}`, promotionData);
        return res.data;
    },
    createPromotion: async (promotionData: PromotionFormData) => {
        const res = await apiClient.post('/discounts', promotionData);
        return res.data;
    },
    deletePromotion: async (id: string) => {
        const res = await apiClient.delete(`/discounts/${id}`);
        return res.data;
    },
    getByBranchId: async (branchId: string) => {
        const res = await apiClient.get(`/discounts/branch/${branchId}`);
        return res.data;
    }
}