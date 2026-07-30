export interface Invoice {
    id: string;
    invoice_code: string;
    booking_id: string;
    issued_by?: string;
    room_charge: number;
    service_charge: number;
    fine_charge?: number;
    late_checkout_fee?: number;
    early_checkout_fee?: number;
    discount_amount: number;
    total_amount: number;
    deposit_used: number;
    amount_due: number;
    refund_amount?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface InvoiceCreateData {
    booking_id: string;
    issued_by?: string;
    notes?: string;
}