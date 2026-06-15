import AccountRepository from '../repositories/accountRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';
import brcypt from 'bcrypt';

class AccountService {
    async getAllAccounts() {
        return await AccountRepository.getAllAccounts();
    };

    async getAccountById(id) {
        return await AccountRepository.getAccountById(id);
    };

    async createAccount(data) {
        const validatedData = {
            ...(data.username && { username: data.username }),
            ...(data.password && { password_hash: data.password }),
            ...(data.role && { role: data.role }),
            ...(data.status && { status: data.status }),
            ...(data.branch_id && { branch_id: data.branch_id }),
        };

        const validator = new Validator();
        if(validatedData.username) {
            validator.isEmpty("Username", validatedData.username)
        }
        if(validatedData.password_hash) {
            validator.isEmpty("Password", validatedData.password_hash)
            validator.validatePassword(validatedData.password_hash);
        }

        validator.isString("Username", validatedData.username);
        validator.maxLength("Username", validatedData.username, 200);
        
        if(validatedData.role) {
            validator.validateAccountRole(validatedData.role);
        }
        if(validatedData.status) {
            validator.validateAccountStatus(validatedData.status);
        }
        if(validatedData.branch_id) {
            validator.isUUID("Branch ID", validatedData.branch_id);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const existingAccount = await AccountRepository.getAccountByUsername(validatedData.username);
        if (existingAccount) {
            throw new ValidationError('400', "Username already exists");
        }

        validatedData.password_hash = await brcypt.hash(validatedData.password_hash, Number(process.env.SALT_ROUNDS) || 5);

        return await AccountRepository.createAccount(validatedData);
    };

    async updateAccount(id, data) {
        const validatedData = {
            ...(data.password && { password_hash: data.password }),
            ...(data.role && { role: data.role }),
            ...(data.status && { status: data.status }),
            ...(data.branch_id && { branch_id: data.branch_id }),
        };

        const validator = new Validator();

        if(validatedData.password_hash) {
            validator.isString("Password Hash", validatedData.password_hash);
            validator.validatePassword(validatedData.password_hash);
        }
        if(validatedData.role) {
            validator.validateAccountRole(validatedData.role);
        }
        if(validatedData.status) {
            validator.validateAccountStatus(validatedData.status);
        }
        if(validatedData.branch_id) {
            validator.isUUID("Branch ID", validatedData.branch_id);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        
        const existingAccount = await AccountRepository.getAccountById(id);
        if (!existingAccount) {
            throw new ValidationError('404', "Account not found");
        }

        validatedData.password_hash = await brcypt.hash(validatedData.password_hash, Number(process.env.SALT_ROUNDS) || 5);

        return await AccountRepository.updateAccount(id, validatedData);
    };

    async deleteAccount(id) {
        return await AccountRepository.deleteAccount(id);
    };
}

export default new AccountService();
