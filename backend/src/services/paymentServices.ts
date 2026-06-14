import PaymentRepository from '../repositories/paymentRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class PaymentService {
    async getAllPayments() {
        return await PaymentRepository.getAllPayments();
    };

    async getPaymentById(id) {
        return await PaymentRepository.getPaymentById(id);
    };

    async createPayment(data) {
        const validatedData = {
            ...(data.booking_id && { booking_id: data.booking_id.trim() }),
            ...(data.invoice_id && { invoice_id: data.invoice_id.trim() }),
            ...(data.payment_method && { payment_method: data.payment_method.trim() }),
            ...(data.status && { status: data.status.trim() }),
            ...(data.amount && { amount: data.amount }),
            ...(data.is_deposit !== undefined && { is_deposit: data.is_deposit }),
            ...(data.transaction_ref && { transaction_ref: data.transaction_ref.trim() }),
            ...(data.processed_by && { processed_by: data.processed_by.trim() }),
            ...(data.notes && { notes: data.notes.trim() }),
        };

        const validator = new Validator();
        if(validator.isEmpty("Booking ID", validatedData.booking_id)) return;
        if(validator.isEmpty("Payment Method", validatedData.payment_method)) return;
        if(validator.isEmpty("Amount", validatedData.amount)) return;

        validator.isUUID("Booking ID", validatedData.booking_id);
        validator.validatePaymentMethod(validatedData.payment_method);
        validator.isDecimal("Amount", validatedData.amount);
        validator.isPositiveNumber("Amount", validatedData.amount);
        
        if(validatedData.invoice_id) {
            validator.isUUID("Invoice ID", validatedData.invoice_id);
        }
        if(validatedData.status) {
            validator.validatePaymentStatus(validatedData.status);
        }
        if(validatedData.is_deposit !== undefined) {
            validator.isBoolean("Is Deposit", validatedData.is_deposit);
        }
        if(validatedData.processed_by) {
            validator.isUUID("Processed By", validatedData.processed_by);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await PaymentRepository.createPayment(validatedData);
    };

    async updatePayment(id, data) {
        const validator = new Validator();
        const existingPayment = await PaymentRepository.getPaymentById(id);
        if (!existingPayment) {
            throw new ValidationError('404', "Payment not found");
        }

        const validatedData = {
            ...(data.payment_method && { payment_method: data.payment_method.trim() }),
            ...(data.status && { status: data.status.trim() }),
            ...(data.amount && { amount: data.amount }),
            ...(data.is_deposit !== undefined && { is_deposit: data.is_deposit }),
            ...(data.transaction_ref && { transaction_ref: data.transaction_ref.trim() }),
            ...(data.paid_at && { paid_at: data.paid_at }),
            ...(data.processed_by && { processed_by: data.processed_by.trim() }),
            ...(data.notes && { notes: data.notes.trim() }),
        };

        if(validatedData.payment_method) {
            validator.validatePaymentMethod(validatedData.payment_method);
        }
        if(validatedData.status) {
            validator.validatePaymentStatus(validatedData.status);
        }
        if(validatedData.amount) {
            validator.isDecimal("Amount", validatedData.amount);
            validator.isPositiveNumber("Amount", validatedData.amount);
        }
        if(validatedData.is_deposit !== undefined) {
            validator.isBoolean("Is Deposit", validatedData.is_deposit);
        }
        if(validatedData.processed_by) {
            validator.isUUID("Processed By", validatedData.processed_by);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await PaymentRepository.updatePayment(id, validatedData);
    };

    async deletePayment(id) {
        return await PaymentRepository.deletePayment(id);
    };
}

export default new PaymentService();
