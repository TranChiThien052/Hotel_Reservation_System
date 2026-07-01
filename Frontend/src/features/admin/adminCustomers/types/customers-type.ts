export interface Customer {
    id: string,
    account_id?: string,
    full_name: string,
    phone: string,
    email: string,
    id_card_number: string,
    nationality: string,
    date_of_birth: string,
    address?: string
}

export interface CustomerFormData {
    account_id?: string,
    full_name: string,
    phone: string,
    email: string,
    id_card_number: string,
    nationality: string,
    date_of_birth: string,
    address?: string
}