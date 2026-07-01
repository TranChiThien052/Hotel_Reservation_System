import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AuthUser, LoginPayload, LoginResponse } from "../types/auth-type";
import { authApi } from "../api/auth-api";

export const loginThunk = createAsyncThunk<LoginResponse, LoginPayload, {rejectValue: string}>(
    "auth/login",
    async (payload, thunkAPI) => {
        try 
        {
            const res = await authApi.login(payload);
            return res;
        }
        catch (error) {
            return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Đăng nhập thất bại");
        }
    },
);


export const getMeThunk = createAsyncThunk<AuthUser, void, {rejectValue: string}>(
    "auth/getMe",
    async (_, thunkAPI) => {
        try
        {
            const res = await authApi.getMe();
            return res;
        }catch (error) {
            return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Lấy thông tin người dùng thất bại");
        }
    },
);