import StaffRepository from '../repositories/staffRepo';
import AccountRepository from '../repositories/accountRepo';
import BranchRepository from '../repositories/branchRepo';
import { Validator, ValidationError } from '../middlewares/validateData';

class StaffService {
    async getAllStaff() {
        return await StaffRepository.getAllStaff();
    };

    async getStaffById(id) {
        return await StaffRepository.getStaffById(id);
    };

    async getStaffByBranchId(branch_id) {
        const validator = new Validator();
        if (!validator.isEmpty("Branch ID", branch_id))
            validator.isUUID("Branch ID", branch_id)
        if (validator.error.length > 0)
            throw new ValidationError('400', validator.clearError())
        const branch = await BranchRepository.getBranchById(branch_id)
        if (!branch)
            throw new ValidationError('404', "Branch not found")
        return await StaffRepository.getStaffByBranchId(branch_id);
    };

    async getStaffByAccountId(account_id) {
        return await StaffRepository.getStaffByAccountId(account_id);
    };

    async createStaff(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.account_id && { account_id: data.account_id }),
            ...(data.full_name && { full_name: data.full_name }),
            ...(data.phone && { phone: data.phone }),
            ...(data.position && { position: data.position }),
        };

        const validator = new Validator();
        if (validator.isEmpty("Branch ID", validatedData.branch_id))
            throw new ValidationError('400', "Branch ID is required");
        if (validator.isEmpty("Account ID", validatedData.account_id))
            throw new ValidationError('400', "Account ID is required");
        if (validator.isEmpty("Full Name", validatedData.full_name))
            throw new ValidationError('400', "Full Name is required");

        validator.isUUID("Branch ID", validatedData.branch_id);
        validator.isUUID("Account ID", validatedData.account_id);
        validator.isString("Full Name", validatedData.full_name);

        if (validatedData.phone) {
            validator.validatePhoneNumber(validatedData.phone);
        }
        if (validatedData.position) {
            validator.isString("Position", validatedData.position);
            validator.validateEnum("Position", validatedData.position, ["manager", "staff", "admin"]);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const validatingAccount = await StaffRepository.getValidatingInformation();
        const duplicatePhoneStaff = validatingAccount.find(account => account.phone === validatedData.phone);

        if (duplicatePhoneStaff) {
            throw new ValidationError('400', "Phone number already exists");
        }

        return await StaffRepository.createStaff(validatedData);
    };

    async updateStaff(id, data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.full_name && { full_name: data.full_name }),
            ...(data.phone && { phone: data.phone }),
            ...(data.position && { position: data.position }),
        };

        const validator = new Validator();

        if (validatedData.branch_id) {
            validator.isUUID("Branch ID", validatedData.branch_id);
        }
        if (validatedData.full_name) {
            validator.isString("Full Name", validatedData.full_name);
        }
        if (validatedData.phone) {
            validator.validatePhoneNumber(validatedData.phone);
        }
        if (validatedData.position) {
            validator.validateEnum("Position", validatedData.position, ["manager", "staff", "admin"]);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const validatingInformation = await StaffRepository.getValidatingInformation();
        const currentStaff = validatingInformation.find(staff => staff.id === id);
        const duplicatePhoneStaff = validatingInformation.find(staff => staff.phone === validatedData.phone && staff.id !== id);

        if (duplicatePhoneStaff) {
            throw new ValidationError('400', "Phone number already exists");
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (!currentStaff) {
            throw new ValidationError('404', "Staff not found");
        }

        const result = await StaffRepository.updateStaff(id, validatedData);

        if (result && validatedData.position)
            await AccountRepository.updateAccount(result.account_id, { role: validatedData.position });

        return result;
    };

    async deleteStaff(id) {
        return await StaffRepository.deleteStaff(id);
    };
}

export default new StaffService();
