export interface HistoryTransaction {
    id: Number;
    action: string;
    target_type: string;
    target_id: string;
    description: string;
    metadata: {};
    created_at: string;
    accounts: {
        id: string;
        customer?: {
            full_name: string;
        },
        staff?: {
            full_name: string;
        },
        branches?: {
            name: string;
        }, 
        role: string;
    };
}

