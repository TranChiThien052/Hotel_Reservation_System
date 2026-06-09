import branchRepository from '../repositories/branchRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class BranchService {
    async getAllBranches() {
        return await branchRepository.getAllBranches();
    };

    async getBranchById(id) {
        return await branchRepository.getBranchById(id);
    };

    async createBranch(data) {
        const validatedData = {
            ...(data.name && { name: data.name }),
            ...(data.address && { address: data.address }),
            ...(data.city && { city: data.city }),
            ...(data.phone && { phone: data.phone }),
            ...(data.email && { email: data.email }),
            ...(data.description && { description: data.description }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        }

        const validator = new Validator();
        validator.isEmpty("Name", validatedData.name);
        validator.isEmpty("Address", validatedData.address);

        if(validatedData.email) {
            validator.validateEmail(validatedData.email);
        }

        if(validatedData.phone) {
            validator.validatePhoneNumber(validatedData.phone);
        }

        if (validator.error.length > 0) {
            throw new ValidationError("400", validator.clearError());
        }

        const validatingInfo = await branchRepository.getValidatingInformation();
        const emailExists = validatingInfo.some(branch => branch.email === validatedData.email);
        const phoneExists = validatingInfo.some(branch => branch.phone === validatedData.phone);

        if (emailExists) {
            validator.pushError("Email already exists");
        }

        if (phoneExists) {
            validator.pushError("Phone number already exists");
        }

        if (validator.error.length > 0) {
            throw new ValidationError("400", validator.clearError());
        }

        return await branchRepository.createBranch(validatedData);
    };

    async updateBranch(id, data) {
        const validator = new Validator();
        const validatedData = {
            ...(data.name && { name: data.name }),
            ...(data.address && { address: data.address }),
            ...(data.city && { city: data.city }),
            ...(data.phone && { phone: data.phone }),
            ...(data.email && { email: data.email }),
            ...(data.description && { description: data.description }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        }

        if(validatedData.email) {
            validator.validateEmail(validatedData.email);
        }

        if(validatedData.phone) {
            validator.validatePhoneNumber(validatedData.phone);
        }

        if (validator.error.length > 0) {
            throw new ValidationError("400", validator.clearError());
        }

        const validatingInfo = await branchRepository.getValidatingInformation();
        const idExists = validatingInfo.some(branch => branch.id === id);
        const emailExists = validatingInfo.some(branch => branch.email === validatedData.email && branch.id !== id);
        const phoneExists = validatingInfo.some(branch => branch.phone === validatedData.phone && branch.id !== id);

        if(!idExists) {
            throw new ValidationError("404", "Branch not found");
        }

        if (emailExists) {
            validator.pushError("Email already exists");
        }

        if (phoneExists) {
            validator.pushError("Phone number already exists");
        }

        if (validator.error.length > 0) {
            throw new ValidationError("400", validator.clearError());
        }

        return await branchRepository.updateBranch(id, validatedData);
    };

    async deleteBranch(id) {
        return await branchRepository.deleteBranch(id);
    };
}

export default new BranchService();