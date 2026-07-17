import HistoryTransactionRepository from '../repositories/historyTransactionRepo';
import StaffRepository from '../repositories/staffRepo';
import { Validator, ValidationError } from '../middlewares/validateData';

class HistoryTransactionService {
    async getAllTransactions() {
        return await HistoryTransactionRepository.getAllTransactions();
    };

    async getTransactionById(id) {
        const result = await HistoryTransactionRepository.getTransactionById(id);
        if (!result) {
            throw new ValidationError('404', 'Transaction not found');
        }
        return result;
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
        return await HistoryTransactionRepository.getTransactionsByAccountId(accountId);
    };

    async getTransactionsByTargetType(target_type) {
        return await HistoryTransactionRepository.getTransactionsByTargetType(target_type);
    };

    async createTransaction(data) {
        return await HistoryTransactionRepository.createTransaction(data);
    }

    async createCreateTransaction(account_id, target_type, target_id, created) {
        return await HistoryTransactionRepository.createTransaction({
            account_id: account_id ?? null,
            action: "create",
            target_type,
            target_id,
            description: `Create ${target_type} with id ${target_id}`,
            metadata: {
                created
            }
        });
    };

    async createUpdateTransaction(account_id, target_type, target_id, before, after, changed_fields) {
        return await HistoryTransactionRepository.createTransaction({
            account_id,
            action: "update",
            target_type,
            target_id,
            description: `Update ${target_type} with id ${target_id}`,
            metadata: {
                before,
                after,
                changed_fields
            }
        });
    }

    async deleteTransaction(id) {
        return await HistoryTransactionRepository.deleteTransaction(id);
    };
}

export default new HistoryTransactionService();
