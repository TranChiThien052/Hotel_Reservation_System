import FineItemRepository from '../repositories/fineItemRepo';
import BranchRepository from '../repositories/branchRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import historyTransactionServices from './historyTransactionServices';

class FineItemService {
    async getAllFineItems() {
        return await FineItemRepository.getAllFineItems();
    };

    async getFineItemById(id) {
        const validator = new Validator();
        if (!validator.isUUID("Fine Item ID", id))
            throw new ValidationError('400', "Fine Item ID must be a valid UUID");
        return await FineItemRepository.getFineItemById(id);
    };

    async getFineItemsByBranchId(branchId) {
        const validator = new Validator();
        if (!validator.isUUID("Branch ID", branchId))
            throw new ValidationError('400', "Branch ID must be a valid UUID");
        return await FineItemRepository.getFineItemsByBranchId(branchId);
    };

    async createFineItem(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.price && { price: data.price }),
        };

        const validator = new Validator();

        if (!validator.isEmpty("Name", validatedData.name)) {
            validator.isString("Name", validatedData.name);
            validator.maxLength("Name", validatedData.name, 200);
        }

        if (validatedData.description) {
            validator.isString("Description", validatedData.description);
        }

        if (!validator.isEmpty("Price", validatedData.price)) {
            validator.isDecimal("Price", validatedData.price);
            validator.isPositiveNumber("Price", validatedData.price);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.branch_id) {
            if (validator.isUUID("Branch ID", validatedData.branch_id)) {
                const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
                if (!branchExists) {
                    validator.pushError("Branch ID does not exist");
                }
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        try {
            const result = await FineItemRepository.createFineItem(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id ?? null,
                    "Fine Item",
                    result.id,
                    result
                )
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async updateFineItem(id, data) {
        const validator = new Validator();
        if (!validator.isEmpty("Fine Item ID", id)) {
            if (validator.isUUID("Fine Item ID", id)) {
                const existingFineItem = await FineItemRepository.getFineItemById(id);
                if (!existingFineItem) {
                    throw new ValidationError('404', "Fine item not found");
                }
            }
        }

        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.price && { price: data.price }),
        };

        if (validatedData.name) {
            validator.isString("Name", validatedData.name);
            validator.maxLength("Name", validatedData.name, 200);
        }

        if (validatedData.description) {
            validator.isString("Description", validatedData.description);
        }

        if (validatedData.price) {
            validator.isDecimal("Price", validatedData.price);
            validator.isPositiveNumber("Price", validatedData.price);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.branch_id) {
            if (validator.isUUID("Branch ID", validatedData.branch_id)) {
                const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
                if (!branchExists) {
                    throw new ValidationError('400', "Branch ID does not exist");
                }
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        try {
            const before = await FineItemRepository.getFineItemById(id);
            const after = await FineItemRepository.updateFineItem(id, validatedData);

            if (after)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id ?? null,
                    "Fine Item",
                    id,
                    before,
                    after,
                    Object.keys(validatedData)
                )

            return after;
        } catch (error: any) {
            throw new Error(error)
        }
    };

    async deleteFineItem(id) {
        return await FineItemRepository.deleteFineItem(id);
    };
}

export default new FineItemService();
