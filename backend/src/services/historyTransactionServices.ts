import HistoryTransactionRepository from '../repositories/historyTransactionRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class HistoryTransactionService {
    async getAllTransactions() {
        return await HistoryTransactionRepository.getAllTransactions();
    };

    async getTransactionById(id) {
        return await HistoryTransactionRepository.getTransactionById(id);
    };

    async createTransaction(data) {
        const validatedData = {
            ...(data.account_id && { account_id: data.account_id.trim() }),
            ...(data.action && { action: data.action.trim() }),
            ...(data.target_type && { target_type: data.target_type.trim() }),
            ...(data.target_id && { target_id: data.target_id.trim() }),
            ...(data.description && { description: data.description.trim() }),
            ...(data.metadata && { metadata: data.metadata }),
        };

        const validator = new Validator();
        if(validator.isEmpty("Action", validatedData.action)) return;

        validator.isString("Action", validatedData.action);
        validator.maxLength("Action", validatedData.action, 100);
        
        if(validatedData.account_id) {
            validator.isUUID("Account ID", validatedData.account_id);
        }
        if(validatedData.target_type) {
            validator.isString("Target Type", validatedData.target_type);
            validator.maxLength("Target Type", validatedData.target_type, 100);
        }
        if(validatedData.target_id) {
            validator.isUUID("Target ID", validatedData.target_id);
        }
        if(validatedData.description) {
            validator.isString("Description", validatedData.description);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await HistoryTransactionRepository.createTransaction(validatedData);
    };

    async deleteTransaction(id) {
        return await HistoryTransactionRepository.deleteTransaction(id);
    };
}

export default new HistoryTransactionService();
