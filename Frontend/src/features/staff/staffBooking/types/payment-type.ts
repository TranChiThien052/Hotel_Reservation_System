export interface PaymentData {
    booking_id: string;
    invoice_id?: string;
    payment_method: string;
    status?: string;
    amount: number;
    is_deposit: boolean;
    transaction_ref?: string;
    processed_by?: string;
    notes?: string;
}

export interface Payment {
    id: string;
    booking_id: string;
    invoice_id?: string;
    payment_method: string;
    status: string;
    amount: number;
    is_deposit: boolean;
    paid_at?: string;
    transaction_ref?: string;
    processed_by?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}