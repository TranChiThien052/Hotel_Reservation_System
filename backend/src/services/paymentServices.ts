import PaymentRepository from '../repositories/paymentRepo.ts';
import BookingRepository from '../repositories/bookingRepo.ts';
import InvoiceRepository from '../repositories/invoiceRepo.ts';
import AccountRepository from '../repositories/accountRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class PaymentService {
    async getAllPayments() {
        return await PaymentRepository.getAllPayments();
    };

    async getPaymentById(id) {
        const validator = new Validator();
        validator.isUUID("Payment ID", id);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        return await PaymentRepository.getPaymentById(id);
    };

    async getPaymentsByBookingId(bookingId) {
        const validator = new Validator();
        if(!validator.isEmpty("Booking ID", bookingId)) {
            if (validator.isUUID("Booking ID", bookingId)) {
                const booking = await BookingRepository.getBookingById(bookingId);
                if (!booking) {
                    throw new ValidationError('404', "Booking not found");
                } 
            }
        }
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        return await PaymentRepository.getPaymentsByBookingId(bookingId);
    };

    async getPaymentsByInvoiceId(invoiceId) {
        const validator = new Validator();
        if(!validator.isEmpty("Invoice ID", invoiceId)) {
            if (validator.isUUID("Invoice ID", invoiceId)) {
                const invoice = await InvoiceRepository.getInvoiceById(invoiceId);
                if (!invoice) {
                    throw new ValidationError('404', "Invoice not found");
                }
            }
        }
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        return await PaymentRepository.getPaymentsByInvoiceId(invoiceId);
    };

    async createPayment(data) {
        const validatedData = {
            ...(data.booking_id && { booking_id: data.booking_id }),
            ...(data.invoice_id && { invoice_id: data.invoice_id }),
            ...(data.payment_method && { payment_method: data.payment_method }),
            ...(data.status && { status: data.status }),
            ...(data.amount && { amount: data.amount }),
            ...(data.is_deposit !== undefined && { is_deposit: data.is_deposit }),
            ...(data.transaction_ref && { transaction_ref: data.transaction_ref }),
            ...(data.processed_by && { processed_by: data.processed_by }),
            ...(data.notes && { notes: data.notes }),
        };

        const validator = new Validator();
        if(!validator.isEmpty("Booking ID", validatedData.booking_id)) 
            validator.isUUID("Booking ID", validatedData.booking_id);
        if(!validator.isEmpty("Payment Method", validatedData.payment_method))
            validator.validatePaymentMethod(validatedData.payment_method);
        if(!validator.isEmpty("Amount", validatedData.amount)) {
            validator.isDecimal("Amount", validatedData.amount);
            validator.isPositiveNumber("Amount", validatedData.amount);
        }
        
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
        if(validatedData.transaction_ref) {
            validator.isString("Transaction Reference", validatedData.transaction_ref);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.booking_id) {
            const booking = await BookingRepository.getBookingById(validatedData.booking_id);
            if (!booking) {
                throw new ValidationError('404', "Booking not found");
            }
        }

        if (validatedData.invoice_id) {
            const invoice = await InvoiceRepository.getInvoiceById(validatedData.invoice_id);
            if (!invoice) {
                throw new ValidationError('404', "Invoice not found");
            }
        }

        if (validatedData.processed_by) {
            const account = await AccountRepository.getAccountById(validatedData.processed_by);
            if (!account) {
                throw new ValidationError('404', "Processed by not found");
            }
        }

        return await PaymentRepository.createPayment(validatedData);
    };

    async updatePayment(id, data) {
        const validator = new Validator();
        validator.isUUID("Payment ID", id);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const existingPayment = await PaymentRepository.getPaymentById(id);
        if (!existingPayment) {
            throw new ValidationError('404', "Payment not found");
        }

        const validatedData = {
            ...(data.payment_method && { payment_method: data.payment_method }),
            ...(data.status && { status: data.status }),
            ...(data.amount && { amount: data.amount }),
            ...(data.is_deposit !== undefined && { is_deposit: data.is_deposit }),
            ...(data.transaction_ref && { transaction_ref: data.transaction_ref }),
            ...(data.paid_at && { paid_at: data.paid_at }),
            ...(data.processed_by && { processed_by: data.processed_by }),
            ...(data.updated_at && { updated_at: data.updated_at }),
            ...(data.notes && { notes: data.notes }),
        };

        if(validatedData.transaction_ref) {
            validator.isString("Transaction Reference", validatedData.transaction_ref);
        }
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
        if(validatedData.paid_at) {
            validator.validateDate(validatedData.paid_at);
        }
        if(validatedData.updated_at) {
            validator.validateDate(validatedData.updated_at);
        }
        if(validatedData.processed_by) {
            validator.isUUID("Processed By", validatedData.processed_by);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if(validatedData.processed_by) {
            const account = await AccountRepository.getAccountById(validatedData.processed_by);
            if (!account) {
                throw new ValidationError('404', "Processed by not found");   
            }
        };

        return await PaymentRepository.updatePayment(id, validatedData);
    };

    async deletePayment(id) {
        return await PaymentRepository.deletePayment(id);
    };
}

export default new PaymentService();
