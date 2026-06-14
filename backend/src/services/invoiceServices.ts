import InvoiceRepository from '../repositories/invoiceRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class InvoiceService {
    async getAllInvoices() {
        return await InvoiceRepository.getAllInvoices();
    };

    async getInvoiceById(id) {
        return await InvoiceRepository.getInvoiceById(id);
    };

    async createInvoice(data) {
        const validatedData = {
            ...(data.invoice_code && { invoice_code: data.invoice_code.trim() }),
            ...(data.booking_id && { booking_id: data.booking_id.trim() }),
            ...(data.room_charge && { room_charge: data.room_charge }),
            ...(data.service_charge && { service_charge: data.service_charge }),
            ...(data.fine_charge && { fine_charge: data.fine_charge }),
            ...(data.late_checkout_fee && { late_checkout_fee: data.late_checkout_fee }),
            ...(data.early_checkout_fee && { early_checkout_fee: data.early_checkout_fee }),
            ...(data.discount_amount && { discount_amount: data.discount_amount }),
            ...(data.total_amount && { total_amount: data.total_amount }),
            ...(data.deposit_used && { deposit_used: data.deposit_used }),
            ...(data.amount_due && { amount_due: data.amount_due }),
            ...(data.refund_amount && { refund_amount: data.refund_amount }),
            ...(data.issued_by && { issued_by: data.issued_by.trim() }),
            ...(data.notes && { notes: data.notes.trim() }),
        };

        const validator = new Validator();
        if(validator.isEmpty("Invoice Code", validatedData.invoice_code)) return;
        if(validator.isEmpty("Booking ID", validatedData.booking_id)) return;
        if(validator.isEmpty("Total Amount", validatedData.total_amount)) return;
        if(validator.isEmpty("Amount Due", validatedData.amount_due)) return;

        validator.isString("Invoice Code", validatedData.invoice_code);
        validator.maxLength("Invoice Code", validatedData.invoice_code, 30);
        validator.isUUID("Booking ID", validatedData.booking_id);
        validator.isDecimal("Total Amount", validatedData.total_amount);
        validator.isNonNegativeNumber("Total Amount", validatedData.total_amount);
        validator.isDecimal("Amount Due", validatedData.amount_due);
        validator.isNonNegativeNumber("Amount Due", validatedData.amount_due);
        
        if(validatedData.room_charge) {
            validator.isDecimal("Room Charge", validatedData.room_charge);
        }
        if(validatedData.service_charge) {
            validator.isDecimal("Service Charge", validatedData.service_charge);
        }
        if(validatedData.issued_by) {
            validator.isUUID("Issued By", validatedData.issued_by);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const codeExists = await InvoiceRepository.getInvoiceByCode(validatedData.invoice_code);
        if (codeExists) {
            throw new ValidationError('400', "Invoice code already exists");
        }

        return await InvoiceRepository.createInvoice(validatedData);
    };

    async updateInvoice(id, data) {
        const validator = new Validator();
        const existingInvoice = await InvoiceRepository.getInvoiceById(id);
        if (!existingInvoice) {
            throw new ValidationError('404', "Invoice not found");
        }

        const validatedData = {
            ...(data.room_charge && { room_charge: data.room_charge }),
            ...(data.service_charge && { service_charge: data.service_charge }),
            ...(data.fine_charge && { fine_charge: data.fine_charge }),
            ...(data.late_checkout_fee && { late_checkout_fee: data.late_checkout_fee }),
            ...(data.early_checkout_fee && { early_checkout_fee: data.early_checkout_fee }),
            ...(data.discount_amount && { discount_amount: data.discount_amount }),
            ...(data.total_amount && { total_amount: data.total_amount }),
            ...(data.deposit_used && { deposit_used: data.deposit_used }),
            ...(data.amount_due && { amount_due: data.amount_due }),
            ...(data.refund_amount && { refund_amount: data.refund_amount }),
            ...(data.notes && { notes: data.notes.trim() }),
        };

        if(validatedData.room_charge) {
            validator.isDecimal("Room Charge", validatedData.room_charge);
        }
        if(validatedData.service_charge) {
            validator.isDecimal("Service Charge", validatedData.service_charge);
        }
        if(validatedData.fine_charge) {
            validator.isDecimal("Fine Charge", validatedData.fine_charge);
        }
        if(validatedData.total_amount) {
            validator.isDecimal("Total Amount", validatedData.total_amount);
            validator.isNonNegativeNumber("Total Amount", validatedData.total_amount);
        }
        if(validatedData.amount_due) {
            validator.isDecimal("Amount Due", validatedData.amount_due);
            validator.isNonNegativeNumber("Amount Due", validatedData.amount_due);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await InvoiceRepository.updateInvoice(id, validatedData);
    };

    async deleteInvoice(id) {
        return await InvoiceRepository.deleteInvoice(id);
    };
}

export default new InvoiceService();
