import { createSlice } from "@reduxjs/toolkit";
import type { AuthUser } from "../types/auth-type";
import { getMeThunk, loginThunk } from "./auth-thunk";

type AuthState = {
    user: AuthUser | null;
    initialized: boolean;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    initialized: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;

            localStorage.removeItem("access_token");
            localStorage.removeItem("accessToken");
        },
        clearError: (state) => {
            state.error = null;
        },
        markInitialized: (state) => {
            state.initialized = true;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                localStorage.setItem("access_token", action.payload.access_token);
            })
            .addCase(loginThunk.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getMeThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMeThunk.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(getMeThunk.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.error = action.payload as string;
            });
            
    },
});

export const { logout, clearError, markInitialized } = authSlice.actions;

export default authSlice.reducer;

