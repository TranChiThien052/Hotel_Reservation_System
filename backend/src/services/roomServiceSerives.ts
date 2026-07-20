import RoomServiceRepository from '../repositories/roomServiceRepo';
import BranchRepository from '../repositories/branchRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import historyTransactionServices from './historyTransactionServices';

class RoomServiceService {
    async getAllServices() {
        return await RoomServiceRepository.getAllServices();
    };

    async getServiceById(id) {
        return await RoomServiceRepository.getServiceById(id);
    };

    async getServiceByBranchId(id) {
        const validator = new Validator();
        if (!validator.isEmpty("Branch ID", id))
            validator.isUUID("Branch ID", id);
        if (validator.error.length > 0)
            throw new ValidationError('400', validator.clearError());
        return await RoomServiceRepository.getServiceByBranchId(id);
    }

    async createService(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.price && { price: data.price }),
            ...(data.unit && { unit: data.unit }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        const validator = new Validator();

        if (!validator.isEmpty("Name", validatedData.name))
            validator.isString("Name", validatedData.name);

        if (!validator.isEmpty("Price", validatedData.price))
            validator.isDecimal("Price", validatedData.price);

        if (!validator.isEmpty("Unit", validatedData.unit))
            validator.isString("Unit", validatedData.unit);

        if (validatedData.description) {
            validator.isString("Description", validatedData.description);
        }

        if (validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.branch_id) {
            const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
            if (!branchExists) {
                throw new ValidationError('400', "Invalid branch ID or branch does not exist");
            }
        }

        try {
            const result = await RoomServiceRepository.createService(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id,
                    "Room Service",
                    result.id,
                    result
                );
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async updateService(id, data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.price && { price: data.price }),
            ...(data.unit && { unit: data.unit }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        const validator = new Validator();

        if (validatedData.name) {
            validator.isString("Name", validatedData.name);
        }
        if (validatedData.description) {
            validator.isString("Description", validatedData.description);
        }
        if (validatedData.price) {
            validator.isDecimal("Price", validatedData.price);
            validator.isPositiveNumber("Price", validatedData.price);
        }
        if (validatedData.unit) {
            validator.isString("Unit", validatedData.unit);
        }
        if (validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.branch_id) {
            const branch = await BranchRepository.getBranchById(validatedData.branch_id);
            if (!branch) {
                throw new ValidationError('400', "Invalid branch ID or branch does not exist");
            }
        }

        const existingService = await RoomServiceRepository.getServiceById(id);
        if (!existingService) {
            throw new ValidationError('404', "Service not found");
        }

        try {
            const after = await RoomServiceRepository.updateService(id, validatedData);
            if (after)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id,
                    "Room Service",
                    id,
                    existingService,
                    after,
                    Object.keys(validatedData)
                );
            return after;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async deleteService(id) {
        return await RoomServiceRepository.deleteService(id);
    };
}

export default new RoomServiceService();