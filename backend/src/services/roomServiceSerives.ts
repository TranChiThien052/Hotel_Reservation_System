import RoomServiceRepository from '../repositories/roomServiceRepo';
import BranchRepository from '../repositories/branchRepo';
import { Validator, ValidationError } from '../middlewares/validateData';

class RoomServiceService {
    async getAllServices() {
        return await RoomServiceRepository.getAllServices();
    };

    async getServiceById(id) {
        return await RoomServiceRepository.getServiceById(id);
    };

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

        return await RoomServiceRepository.createService(validatedData);
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

        const serviceExists = await RoomServiceRepository.getServiceById(id);
        if (!serviceExists) {
            throw new ValidationError('404', "Service not found");
        }

        return await RoomServiceRepository.updateService(id, validatedData);
    };

    async deleteService(id) {
        return await RoomServiceRepository.deleteService(id);
    };
}

export default new RoomServiceService();