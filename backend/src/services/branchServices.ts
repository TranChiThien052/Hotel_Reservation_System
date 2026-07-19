import branchRepository from '../repositories/branchRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import historyTransactionServices from './historyTransactionServices';

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

        // Required fields for POST
        if (validator.isEmpty("Name", validatedData.name))
            throw new ValidationError("400", "Name is required");
        if (validator.isEmpty("Address", validatedData.address))
            throw new ValidationError("400", "Address is required");

        // Type validation
        validator.isString("Name", validatedData.name);
        validator.isString("Address", validatedData.address);
        validator.maxLength("Name", validatedData.name, 150);
        validator.maxLength("Address", validatedData.address, 255);

        if (validatedData.city) {
            validator.isString("City", validatedData.city);
            validator.maxLength("City", validatedData.city, 100);
        }

        if (validatedData.email) {
            validator.validateEmail(validatedData.email);
            validator.maxLength("Email", validatedData.email, 150);
        }

        if (validatedData.phone) {
            validator.validatePhoneNumber(validatedData.phone);
            validator.maxLength("Phone", validatedData.phone, 20);
        }

        if (validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
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

        try {
            const result = await branchRepository.createBranch(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id ?? null,
                    "Branch",
                    result.id,
                    result
                )
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
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

        // Type validation for PUT
        if (validatedData.name) {
            validator.isString("Name", validatedData.name);
            validator.maxLength("Name", validatedData.name, 150);
        }
        if (validatedData.address) {
            validator.isString("Address", validatedData.address);
            validator.maxLength("Address", validatedData.address, 255);
        }
        if (validatedData.city) {
            validator.isString("City", validatedData.city);
            validator.maxLength("City", validatedData.city, 100);
        }
        if (validatedData.description) {
            validator.isString("Description", validatedData.description);
        }

        if (validatedData.email) {
            validator.validateEmail(validatedData.email);
            validator.maxLength("Email", validatedData.email, 150);
        }

        if (validatedData.phone) {
            validator.validatePhoneNumber(validatedData.phone);
            validator.maxLength("Phone", validatedData.phone, 20);
        }

        if (validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if (validator.error.length > 0) {
            throw new ValidationError("400", validator.clearError());
        }

        const validatingInfo = await branchRepository.getValidatingInformation();
        const idExists = validatingInfo.some(branch => branch.id === id);
        const emailExists = validatingInfo.some(branch => branch.email === validatedData.email && branch.id !== id);
        const phoneExists = validatingInfo.some(branch => branch.phone === validatedData.phone && branch.id !== id);

        if (!idExists) {
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

        try {
            const before = await branchRepository.getBranchById(id);
            const result = await branchRepository.updateBranch(id, validatedData);
            if (result)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id ?? null,
                    "Branch",
                    id,
                    before,
                    result,
                    Object.keys(validatedData)
                )
            return result;
        } catch (error: any) {
            throw new Error(error)
        }
    };

    async deleteBranch(id) {
        return await branchRepository.deleteBranch(id);
    };
}

export default new BranchService();