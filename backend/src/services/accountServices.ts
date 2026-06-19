import AccountRepository from '../repositories/accountRepo';
import BranchRepository from '../repositories/branchRepo';
import RefreshTokenRepository from '../repositories/refreshTokenRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import jwt from 'jsonwebtoken';
import brcypt from 'bcrypt';

class AccountService {
    async login(username, password) {
        const validator = new Validator();
        validator.isString("Username", username);
        validator.isString("Password", password);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const account = await AccountRepository.getAccountByUsername(username);
        if (!account) {
            throw new ValidationError('404', "Account not found");
        }
        const isMatch = await brcypt.compare(password, account.password_hash);
        if (!isMatch) {
            throw new ValidationError('400', "Invalid password");
        }

        if (account.status !== 'active') {
            throw new ValidationError('403', "Account is not active");
        }

        let userId;

        if (account.customers) {
            userId = account.customers.id;
        } else if (account.staff) {
            userId = account.staff.id;
        }

        if (!process.env.JWT_SECRET) {
            throw new ValidationError('500', "JWT_SECRET is not defined in environment variables");
        }

        const access_claims = {
            user_id: userId,
            account_id: account.id,
            role: account.role,
        };

        const refresh_claims = {
            user_id: userId,
            account_id: account.id,
        };

        const refresh_token = jwt.sign(refresh_claims, process.env.JWT_SECRET, { expiresIn: '1d' });

        const hashedRefreshToken = await brcypt.hash(refresh_token, Number(process.env.SALT_ROUNDS) || 5);

        const RefreshTokenRepo = new RefreshTokenRepository();
        const createRefreshToken = await RefreshTokenRepo.createRefreshToken({
            account_id: account.id,
            token_hash: hashedRefreshToken,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        if (!createRefreshToken) {
            throw new ValidationError('500', "Failed to create refresh token");
        }

        const access_token = jwt.sign(access_claims, process.env.JWT_SECRET, { expiresIn: '30m' });

        return {
            access_token,
            refresh_token,
            user_id: userId,
            account_id: account.id,
            role: account.role
        };
    }

    async refreshToken(oldRefreshToken) {
        const validator = new Validator();
        validator.isString("Refresh Token", oldRefreshToken);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const RefreshTokenRepo = new RefreshTokenRepository();
        const decoded = jwt.decode(oldRefreshToken);
        if (!decoded || typeof decoded === 'string' || !decoded.account_id) {
            throw new ValidationError('400', "Invalid refresh token");
        }
        const refreshTokens = await RefreshTokenRepo.getRefreshTokenByAccountId(decoded.account_id);
        const validRefreshToken = refreshTokens.find(token => token.expires_at > new Date() && !token.is_revoked);

        if (!validRefreshToken) {
            throw new ValidationError('404', "Refresh token not found");
        }

        const account = await AccountRepository.getAccountById(validRefreshToken.account_id);
        if (!account) {
            throw new ValidationError('404', "Account not found");
        }
        if (account.status !== 'active') {
            throw new ValidationError('403', "Account is not active");
        }
        let userId;

        if (account.customers) {
            userId = account.customers.id;
        } else if (account.staff) {
            userId = account.staff.id;
        }
        if (!process.env.JWT_SECRET) {
            throw new ValidationError('500', "JWT_SECRET is not defined in environment variables");
        }
        const access_claims = {
            user_id: userId,
            account_id: account.id,
            role: account.role,
        };
        const refresh_claims = {
            user_id: userId,
            account_id: account.id,
        };
        const new_refresh_token = jwt.sign(refresh_claims, process.env.JWT_SECRET, { expiresIn: '1d' });
        const hashedRefreshToken = await brcypt.hash(new_refresh_token, Number(process.env.SALT_ROUNDS) || 5);
        const createRefreshToken = await RefreshTokenRepo.createRefreshToken({
            account_id: account.id,
            token_hash: hashedRefreshToken,
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
        if (!createRefreshToken) {
            throw new ValidationError('500', "Failed to create refresh token");
        }
        const access_token = jwt.sign(access_claims, process.env.JWT_SECRET, { expiresIn: '30m' });
        await RefreshTokenRepo.updateRefreshToken(validRefreshToken.id, { is_revoked: true });
        return {
            access_token,
            refresh_token: new_refresh_token,
            user_id: userId,
            account_id: account.id,
            role: account.role
        };
    }

    async logout(refreshToken) {
        const validator = new Validator();
        validator.isString("Refresh Token", refreshToken);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const decoded = jwt.decode(refreshToken);
        if (!decoded || typeof decoded === 'string' || !decoded.account_id) {
            throw new ValidationError('400', "Invalid refresh token");
        }
        const RefreshTokenRepo = new RefreshTokenRepository();
        const refreshTokens = await RefreshTokenRepo.getRefreshTokenByAccountId(decoded.account_id);
        const validRefreshToken = refreshTokens.find(token => token.expires_at > new Date() && !token.is_revoked);
        if (!validRefreshToken) {
            throw new ValidationError('404', "Refresh token not found");
        }
        await RefreshTokenRepo.updateRefreshToken(validRefreshToken.id, { is_revoked: true });
        return { message: "Logout successful" };
    };

    async getAccountInformationFromToken(token) {
        const validator = new Validator();
        validator.isString("Token", token);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const decoded = jwt.decode(token);
        if (!decoded || typeof decoded === 'string' || !decoded.account_id) {
            throw new ValidationError('400', "Invalid token");
        }
        const account = await AccountRepository.getAccountById(decoded.account_id);
        if (!account) {
            throw new ValidationError('404', "Account not found");
        }
        return account;
    }

    async getAllAccounts() {
        return await AccountRepository.getAllAccounts();
    };

    async getAccountByUsername(username) {
        const validator = new Validator();
        validator.isString("Username", username);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await AccountRepository.getAccountByUsername(username);
    };

    async getAccountById(id) {
        const validator = new Validator();
        validator.isUUID("Account ID", id);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
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
        if (validatedData.username) {
            validator.isEmpty("Username", validatedData.username)
        }
        if (validatedData.password_hash) {
            validator.isEmpty("Password", validatedData.password_hash)
            validator.validatePassword(validatedData.password_hash);
        }

        validator.isString("Username", validatedData.username);
        validator.maxLength("Username", validatedData.username, 200);

        if (validatedData.role) {
            validator.validateAccountRole(validatedData.role);
        }
        if (validatedData.status) {
            validator.validateAccountStatus(validatedData.status);
        }
        if (validatedData.branch_id) {
            validator.isUUID("Branch ID", validatedData.branch_id);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const existingAccount = await AccountRepository.getAccountByUsername(validatedData.username);
        if (existingAccount) {
            throw new ValidationError('400', "Username already exists");
        }

        if (validatedData.branch_id) {
            const existingBranch = await BranchRepository.getBranchById(validatedData.branch_id);
            if (!existingBranch) {
                throw new ValidationError('404', "Branch not found");
            }
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

        if (validatedData.password_hash) {
            validator.isString("Password Hash", validatedData.password_hash);
            validator.validatePassword(validatedData.password_hash);
            validatedData.password_hash = await brcypt.hash(validatedData.password_hash, Number(process.env.SALT_ROUNDS) || 5);
        }
        if (validatedData.role) {
            validator.validateAccountRole(validatedData.role);
        }
        if (validatedData.status) {
            validator.validateAccountStatus(validatedData.status);
        }
        if (validatedData.branch_id) {
            if (validator.isUUID("Branch ID", validatedData.branch_id)) {
                const existingBranch = await BranchRepository.getBranchById(validatedData.branch_id);
                if (!existingBranch) {
                    throw new ValidationError('404', "Branch not found");
                }
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validator.isUUID("ID", id)) {
            const existingAccount = await AccountRepository.getAccountById(id);
            if (!existingAccount) {
                throw new ValidationError('404', "Account not found");
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await AccountRepository.updateAccount(id, validatedData);
    };

    async deleteAccount(id) {
        return await AccountRepository.deleteAccount(id);
    };
}

export default new AccountService();
