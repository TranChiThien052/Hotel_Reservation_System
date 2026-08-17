import HistoryTransactionRepository from '../repositories/historyTransactionRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import branchServices from './branchServices';
import staffServices from './staffServices';

class HistoryTransactionService {
    async getAllTransactions() {
        const result = await HistoryTransactionRepository.getAllTransactions();
        const response = result.map(r => {
            return {
                ...r,
                id: r.id.toString(),
            }
        })
        return response;
    };

    async getTransactionById(id) {
        const result = await HistoryTransactionRepository.getTransactionById(id);
        if (!result) {
            throw new ValidationError('404', 'Transaction not found');
        }
        const response = {
            ...result,
            id: result.id.toString(),
        }
        return response;
    };

    async getTransactionByBranchId(id) {
        const branch = await branchServices.getBranchById(id);
        if (!branch)
            throw new ValidationError("404", "Branch not found")
        const result = await HistoryTransactionRepository.getTransactionByBranchId(id);
        const response = result.map(r => {
            return {
                ...r,
                id: r.id.toString(),
            }
        })
        return response;
    }

    async getTransactionsByAccountId(accountId) {
        const validator = new Validator();
        const account = await staffServices.getStaffByAccountId(accountId);
        if (!account) {
            throw new ValidationError('404', "Account ID does not exist");
        }
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const result = await HistoryTransactionRepository.getTransactionsByAccountId(accountId);
        const response = result.map(r => {
            return {
                ...r,
                id: r.id.toString(),
            }
        })
        return response;
    };

    async getTransactionsByTargetType(target_type) {
        const result = await HistoryTransactionRepository.getTransactionsByTargetType(target_type);
        const response = result.map(r => {
            return {
                ...r,
                id: r.id.toString(),
            }
        })
        return response;
    };

    async createTransaction(data) {
        const result = await HistoryTransactionRepository.createTransaction(data);
        const response = {
            ...result,
            id: result.id.toString(),
        }
        return response;
    }

    async createCreateTransaction(account_id, target_type, target_id, created) {
        const result = await HistoryTransactionRepository.createTransaction({
            account_id: account_id ?? null,
            action: "create",
            target_type,
            target_id,
            description: `Tạo mới ${target_type} với id ${target_id}`,
            metadata: {
                created
            }
        });
        const response = {
            ...result,
            id: result.id.toString(),
        }
        return response;
    };

    async createUpdateTransaction(account_id, target_type, target_id, before, after, changed_fields) {
        const result = await HistoryTransactionRepository.createTransaction({
            account_id,
            action: "update",
            target_type,
            target_id,
            description: `Cập nhật thông tin ${target_type} với id ${target_id}`,
            metadata: {
                before,
                after,
                changed_fields
            }
        });
        const response = {
            ...result,
            id: result.id.toString(),
        }
        return response;
    }

    async createDeleteTransaction(account_id, target_type, target_id, deleted) {
        const result = await HistoryTransactionRepository.createTransaction({
            account_id,
            action: "delete",
            target_type,
            target_id,
            description: `Xóa thông tin ${target_type} với id ${target_id}`,
            metadata: {
                deleted
            }
        });
        const response = {
            ...result,
            id: result.id.toString(),
        }
        return response;
    };
}

export default new HistoryTransactionService();
