import InvoiceFineRepository from '../repositories/invoiceFineRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class InvoiceFineService {
    async getAllInvoiceFines() {
        return await InvoiceFineRepository.getAllInvoiceFines();
    };

    async getInvoiceFineById(id) {
        return await InvoiceFineRepository.getInvoiceFineById(id);
    };

    async createInvoiceFine(data) {
        const validatedData = {
            ...(data.invoice_id && { invoice_id: data.invoice_id.trim() }),
            ...(data.fine_item_id && { fine_item_id: data.fine_item_id.trim() }),
            ...(data.description && { description: data.description.trim() }),
            ...(data.amount && { amount: data.amount }),
            ...(data.added_by && { added_by: data.added_by.trim() }),
        };

        const validator = new Validator();
        if(validator.isEmpty("Invoice ID", validatedData.invoice_id)) return;
        if(validator.isEmpty("Description", validatedData.description)) return;
        if(validator.isEmpty("Amount", validatedData.amount)) return;

        validator.isUUID("Invoice ID", validatedData.invoice_id);
        validator.isString("Description", validatedData.description);
        validator.maxLength("Description", validatedData.description, 300);
        validator.isDecimal("Amount", validatedData.amount);
        validator.isPositiveNumber("Amount", validatedData.amount);
        
        if(validatedData.fine_item_id) {
            validator.isUUID("Fine Item ID", validatedData.fine_item_id);
        }
        if(validatedData.added_by) {
            validator.isUUID("Added By", validatedData.added_by);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await InvoiceFineRepository.createInvoiceFine(validatedData);
    };

    async updateInvoiceFine(id, data) {
        const validator = new Validator();
        const existingInvoiceFine = await InvoiceFineRepository.getInvoiceFineById(id);
        if (!existingInvoiceFine) {
            throw new ValidationError('404', "Invoice fine not found");
        }

        const validatedData = {
            ...(data.description && { description: data.description.trim() }),
            ...(data.amount && { amount: data.amount }),
        };

        if(validatedData.description) {
            validator.isString("Description", validatedData.description);
            validator.maxLength("Description", validatedData.description, 300);
        }
        if(validatedData.amount) {
            validator.isDecimal("Amount", validatedData.amount);
            validator.isPositiveNumber("Amount", validatedData.amount);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await InvoiceFineRepository.updateInvoiceFine(id, validatedData);
    };

    async deleteInvoiceFine(id) {
        return await InvoiceFineRepository.deleteInvoiceFine(id);
    };
}

export default new InvoiceFineService();
