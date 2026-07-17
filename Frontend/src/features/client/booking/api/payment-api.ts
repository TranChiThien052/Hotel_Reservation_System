import apiClient from "@/shared/lib/axios";

export interface ZaloPayResultParams {
    appid: number;
    checksum: string;
    apptransid: string;
    pmcid: string;
    bankcode : string;
    amount : number;
    discountamount : number;
    status : string;
}

export const paymentApi = {
    createZaloPayPayment: async (booking_id: string, amount: number, is_deposit: boolean) => {
        const res = await apiClient.post(`/payments/zalopay/create`, { booking_id, amount, is_deposit });
        return res.data;
    },
    getZaloPayPaymentResult: async (params: ZaloPayResultParams) => {
        const res = await apiClient.get(`/payments/zalopay/payment_result`, { params });
        return res.data;
    }
}