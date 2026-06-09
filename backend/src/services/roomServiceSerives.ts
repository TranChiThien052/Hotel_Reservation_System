import RoomServiceRepository from '../repositories/roomServiceRepo.ts';
import BranchRepository from '../repositories/branchRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class RoomServiceService {
    async getAllServices() {
        return await RoomServiceRepository.getAllServices();
    };

    async getServiceById(id) {
        return await RoomServiceRepository.getServiceById(id);
    };

    async createService(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id.trim() }),
            ...(data.name && { name: data.name.trim() }),
            ...(data.description && { description: data.description.trim() }),
            ...(data.price && { price: data.price }),
            ...(data.unit && { unit: data.unit.trim() }),
            ...(data.is_active && { is_active: data.is_active }),
        };

        const validator = new Validator();

        validator.isEmpty("Name", validatedData.name);

        if(!validator.isEmpty("Price", validatedData.price)) {
            validator.isNumber("Price", validatedData.price);
        }

        validator.isEmpty("Unit", validatedData.unit);

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const branches = await BranchRepository.getAllBranches();
        const branchIds = branches.map(branch => branch.id);

        if (!branchIds.includes(validatedData.branch_id)) {
            throw new ValidationError('400', "Invalid branch ID");
        }

        return await RoomServiceRepository.createService(validatedData);
    };  

    async updateService(id, data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id.trim() }),
            ...(data.name && { name: data.name.trim() }),
            ...(data.description && { description: data.description.trim() }),
            ...(data.price && { price: data.price }),
            ...(data.unit && { unit: data.unit.trim() }),
            ...(data.is_active && { is_active: data.is_active }),
        };

        const validator = new Validator();

        if (validatedData.price) {
            validator.isNumber("Price", validatedData.price);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const branches = await BranchRepository.getAllBranches();
        const branchIds = branches.map(branch => branch.id);

        if (validatedData.branch_id && !branchIds.includes(validatedData.branch_id)) {
            throw new ValidationError('400', "Invalid branch ID");
        }

        return await RoomServiceRepository.updateService(id, validatedData);
    };

    async deleteService(id) {
        return await RoomServiceRepository.deleteService(id);
    };
}

export default new RoomServiceService();