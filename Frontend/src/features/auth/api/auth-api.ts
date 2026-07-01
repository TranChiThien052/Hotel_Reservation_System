import apiClient from "@/shared/lib/axios";
import type { AuthUser, LoginPayload, LoginResponse } from "../types/auth-type";

export const authApi = {
    login: async (payload: LoginPayload): Promise<LoginResponse> => {
        const res = await apiClient.post<LoginResponse>('/auth/login', payload);
        return res.data;
    },
    getMe: async (): Promise<AuthUser> => {
        const res = await apiClient.get('/auth/me');
        return res.data;
    },
    logout: async (): Promise<void> => {
        const res = await apiClient.post('/auth/logout');
        return res.data;
    },
    refreshToken: async () => {
        const res = await apiClient.post('/auth/refresh');
        return res.data;
    }
}