import InvoiceFineRepository from '../repositories/invoiceFineRepo';
import InvoiceRepository from '../repositories/invoiceRepo';
import FineItemRepository from '../repositories/fineItemRepo';
import AccountRepository from '../repositories/accountRepo';
import { Validator, ValidationError } from '../middlewares/validateData';

class InvoiceFineService {
    async getAllInvoiceFines() {
        return await InvoiceFineRepository.getAllInvoiceFines();
    };

    async getInvoiceFineById(id) {
        const validator = new Validator();
        if (!validator.isEmpty("Invoice Fine ID", id)) {
            validator.isUUID("Invoice Fine ID", id);
        }
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        return await InvoiceFineRepository.getInvoiceFineById(id);
    };

    async getInvoiceFinesByInvoiceId(invoiceId) {
        const validator = new Validator();
        if (!validator.isEmpty("Invoice ID", invoiceId)) {
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
        return await InvoiceFineRepository.getInvoiceFinesByInvoiceId(invoiceId);
    }

    async createInvoiceFine(data) {
        const validatedData = {
            ...(data.invoice_id && { invoice_id: data.invoice_id }),
            ...(data.fine_item_id && { fine_item_id: data.fine_item_id }),
            ...(data.description && { description: data.description }),
            ...(data.amount && { amount: data.amount }),
            ...(data.added_by && { added_by: data.added_by }),
        };

        const validator = new Validator();

        if (!validator.isEmpty("Invoice ID", validatedData.invoice_id)) {
            if (validator.isUUID("Invoice ID", validatedData.invoice_id)) {
                const invoice = await InvoiceRepository.getInvoiceById(validatedData.invoice_id);
                if (!invoice) {
                    throw new ValidationError('404', "Invoice not found");
                }
            }
        }

        if (validatedData.fine_item_id) {
            if (validator.isUUID("Fine Item ID", validatedData.fine_item_id)) {
                const fineItem = await FineItemRepository.getFineItemById(validatedData.fine_item_id);
                if (!fineItem) {
                    throw new ValidationError('404', "Fine item not found");
                }
            }
        }

        if (validatedData.added_by) {
            if (validator.isUUID("Added By", validatedData.added_by)) {
                const staffAccount = await AccountRepository.getAccountById(validatedData.added_by);
                if (!staffAccount) {
                    throw new ValidationError('404', "Added by not found");
                }
            }
        }

        validator.isString("Description", validatedData.description);
        validator.maxLength("Description", validatedData.description, 300);
        validator.isDecimal("Amount", validatedData.amount);
        validator.isPositiveNumber("Amount", validatedData.amount);

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await InvoiceFineRepository.createInvoiceFine(validatedData);
    };

    async updateInvoiceFine(id, data) {
        const validator = new Validator();
        if (!validator.isEmpty("Invoice Fine ID", id)) {
            validator.isUUID("Invoice Fine ID", id);
        }

        const validatedData = {
            ...(data.fine_item_id && { fine_item_id: data.fine_item_id }),
            ...(data.description && { description: data.description }),
            ...(data.amount && { amount: data.amount }),
            ...(data.added_by && { added_by: data.added_by }),
        };

        if (validatedData.description) {
            validator.isString("Description", validatedData.description);
            validator.maxLength("Description", validatedData.description, 300);
        }
        if (validatedData.amount) {
            validator.isDecimal("Amount", validatedData.amount);
            validator.isPositiveNumber("Amount", validatedData.amount);
        }
        if (validatedData.fine_item_id) {
            validator.isUUID("Fine Item ID", validatedData.fine_item_id);
        }
        if (validatedData.added_by) {
            validator.isUUID("Added By", validatedData.added_by);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const existingInvoiceFine = await InvoiceFineRepository.getInvoiceFineById(id);
        if (!existingInvoiceFine) {
            throw new ValidationError('404', "Invoice fine not found");
        }

        if (validatedData.fine_item_id) {
            const fineItem = await FineItemRepository.getFineItemById(validatedData.fine_item_id);
            if (!fineItem) {
                throw new ValidationError('404', "Fine item not found");
            }
        }

        if (validatedData.added_by) {
            const staffAccount = await AccountRepository.getAccountById(validatedData.added_by);
            if (!staffAccount) {
                throw new ValidationError('404', "Added by not found");
            }
        }

        return await InvoiceFineRepository.updateInvoiceFine(id, validatedData);
    };

    async deleteInvoiceFine(id) {
        return await InvoiceFineRepository.deleteInvoiceFine(id);
    };
}

export default new InvoiceFineService();
