import HistoryTransactionRepository from '../repositories/historyTransactionRepo';
import StaffRepository from '../repositories/staffRepo';
import { Validator, ValidationError } from '../middlewares/validateData';

class HistoryTransactionService {
    async getAllTransactions() {
        const result = await HistoryTransactionRepository.getAllTransactions();
        const response = result.map(transaction => ({
            ...transaction,
            id: transaction.id.toString(),
        }));
        return response;
    };

    async getTransactionById(id) {
        const result = await HistoryTransactionRepository.getTransactionById(id);
        if (!result) {
            throw new ValidationError('404', 'Transaction not found');
        }
        return {
            ...result,
            id: result.id.toString(),
        };
    };

    async getTransactionsByAccountId(accountId) {
        const validator = new Validator();
        if (!validator.isEmpty("Account ID", accountId)) {
            if (validator.isUUID("Account ID", accountId)) {
                const account = await StaffRepository.getStaffByAccountId(accountId);
                if (!account) {
                    throw new ValidationError('404', "Account ID does not exist");
                }
            }
        }
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const result = await HistoryTransactionRepository.getTransactionsByAccountId(accountId);
        const response = result.map(transaction => ({
            ...transaction,
            id: transaction.id.toString(),
        }));
        return response;
    };

    async createTransaction(data) {
        const validatedData = {
            ...(data.account_id && { account_id: data.account_id }),
            ...(data.action && { action: data.action }),
            ...(data.target_type && { target_type: data.target_type }),
            ...(data.target_id && { target_id: data.target_id }),
            ...(data.description && { description: data.description }),
            ...(data.metadata && { metadata: data.metadata }),
        };

        const validator = new Validator();

        if (!validator.isEmpty("Account ID", validatedData.account_id))
            if (validator.isUUID("Account ID", validatedData.account_id)) {
                const account = await StaffRepository.getStaffByAccountId(validatedData.account_id);
                if (!account) {
                    throw new ValidationError('404', "Account ID does not exist");
                }
            }

        if (!validator.isEmpty("Action", validatedData.action)) {
            validator.isString("Action", validatedData.action);
            validator.maxLength("Action", validatedData.action, 100);
        }
        if (validatedData.target_type) {
            validator.isString("Target Type", validatedData.target_type);
            validator.maxLength("Target Type", validatedData.target_type, 100);
        }
        if (validatedData.target_id) {
            validator.isUUID("Target ID", validatedData.target_id);
        }
        if (validatedData.description) {
            validator.isString("Description", validatedData.description);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const result = await HistoryTransactionRepository.createTransaction(validatedData);
        const response = {
            ...result,
            id: result.id.toString(),
        };
        return response;
    };

    async deleteTransaction(id) {
        return await HistoryTransactionRepository.deleteTransaction(id);
    };
}

export default new HistoryTransactionService();
