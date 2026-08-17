import StaffRepository from '../repositories/staffRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import historyTransactionServices from './historyTransactionServices';
import branchServices from './branchServices';
import accountServices from './accountServices';

class StaffService {
    async getAllStaff() {
        return await StaffRepository.getAllStaff();
    };

    async getStaffById(id) {
        const validator = new Validator();
        if (!validator.isUUID("Staff ID", id))
            throw new ValidationError("400", validator.clearError());
        return await StaffRepository.getStaffById(id);
    };

    async getStaffByBranchId(branch_id) {
        const branch = await branchServices.getBranchById(branch_id);
        if (!branch)
            throw new ValidationError("404", "Branch not found");
        return await StaffRepository.getStaffByBranchId(branch_id);
    };

    async getStaffByAccountId(account_id) {
        const account = await accountServices.getAccountById(account_id);
        if (!account)
            throw new ValidationError("404", "Account not found");
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

        const branch = await branchServices.getBranchById(validatedData.branch_id);
        if (!branch)
            throw new ValidationError("404", "Branch not found");
        if (validatedData.account_id) {
            const account = await accountServices.getAccountById(validatedData.account_id);
            if (!account)
                throw new ValidationError("404", "Account not found");
        }
        if (!validator.isEmpty("Full Name", validatedData.full_name))
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
            throw new ValidationError('409', "Phone number already exists");
        }

        try {
            const result = await StaffRepository.createStaff(validatedData);
            if (result) {
                await historyTransactionServices.createCreateTransaction(
                    validatedData.log_account_id,
                    "Nhân viên",
                    result.account_id,
                    result
                );
            }
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async updateStaff(id, data) {
        const existingStaff = await this.getStaffById(id);
        if (!existingStaff)
            throw new ValidationError("404", "Staff not found");
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.full_name && { full_name: data.full_name }),
            ...(data.phone && { phone: data.phone }),
            ...(data.position && { position: data.position }),
        };

        const validator = new Validator();

        const branch = await branchServices.getBranchById(validatedData.branch_id);
        if (!branch)
            throw new ValidationError("404", "Branch not found");
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
        const duplicatePhoneStaff = validatingInformation.find(staff => staff.phone === validatedData.phone && staff.id !== id);

        if (duplicatePhoneStaff) {
            throw new ValidationError('409', "Phone number already exists");
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const before = existingStaff;
        const result = await StaffRepository.updateStaff(id, validatedData);

        if (result) {
            let updateData = {
                ...(validatedData.position && { role: validatedData.position }),
                ...(validatedData.branch_id && { branch_id: validatedData.branch_id }),
            };
            await accountServices.updateAccount(result.account_id, { ...updateData, log_account_id: data.log_account_id });
            await historyTransactionServices.createUpdateTransaction(
                data.log_account_id,
                "Nhân viên",
                result.account_id,
                before,
                result,
                Object.keys(validatedData)
            );
        }

        return result;
    };

    async deleteStaff(id) {
        return await StaffRepository.deleteStaff(id);
    };
}

export default new StaffService();
