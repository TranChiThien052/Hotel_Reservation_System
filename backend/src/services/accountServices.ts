import AccountRepository from '../repositories/accountRepo';
import BranchRepository from '../repositories/branchRepo';
import RefreshTokenRepository from '../repositories/refreshTokenRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import { prisma } from '../config/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import accountRepo from '../repositories/accountRepo';
import { generateToken, hashToken } from '../middlewares/generator';
import ResetPasswordTokenRepo from '../repositories/resetPasswordTokenRepo';
import { sendPasswordResetEmail } from '../services/emailServices'

class AccountService {
    async requestPasswordReset(email) {
        const user = await accountRepo.getAccountByEmail(email);
        if (!user)
            throw new ValidationError('404', "Account not found");
        const token = generateToken();
        await ResetPasswordTokenRepo.createResetPasswordToken({
            account_id: user.accounts?.id,
            token_hash: hashToken(token),
            expires_at: new Date(Date.now() + 30 * 60 * 1000),
            is_used: false,
        })
        await sendPasswordResetEmail(email, user.full_name, token);
        return {
            message: 'Password reset email sent successfully',
        };
    }

    async resetPassword(newPassword, token) {
        const validToken = await ResetPasswordTokenRepo.getResetPasswordToken(hashToken(token));
        if (!validToken)
            throw new ValidationError('404', 'Token not found');
        if (validToken.is_used || validToken.expires_at < new Date())
            throw new ValidationError('400', 'Token is not valid');
        await prisma.$transaction(async () => {
            const hashedPassword = await bcrypt.hash(newPassword, Number(process.env.SALT_ROUNDS) || 5);
            await accountRepo.updateAccount(validToken.account_id, { password_hash: hashedPassword });
            await ResetPasswordTokenRepo.updateResetPasswordToken(validToken.token_hash, { is_used: true });
        }).catch(error => {
            console.log(error);
            throw new ValidationError('500', error.message);
        })
        return {
            message: 'Password changed successfully',
        };
    }

    async login(username, password) {
        const validator = new Validator();
        if (!validator.isEmpty("Username", username))
            if (validator.isString("Username", username)) {
                username = username.toLowerCase();
            }
        if (!validator.isEmpty("Password", password))
            validator.isString("Password", password);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const account = await AccountRepository.getAccountByUsername(username);
        if (!account) {
            throw new ValidationError('404', "Account not found");
        }
        const isMatch = await bcrypt.compare(password, account.password_hash);
        if (!isMatch) {
            throw new ValidationError('400', "Incorrect password");
        }

        if (account.status !== 'active') {
            throw new ValidationError('403', "Account is not active");
        }

        if (!process.env.JWT_SECRET) {
            throw new ValidationError('500', "JWT_SECRET is not defined in environment variables");
        }

        const refresh_token = jwt.sign(
            {
                account_id: account.id,
                user_id: account.customers ? account.customers?.id : account.staff?.id,
                role: account.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const RefreshTokenRepo = new RefreshTokenRepository();
        const createRefreshToken = await RefreshTokenRepo.createRefreshToken({
            account_id: account.id,
            token_hash: await bcrypt.hash(refresh_token, Number(process.env.SALT_ROUNDS) || 5),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        if (!createRefreshToken) {
            throw new ValidationError('500', "Failed to create refresh token");
        }

        const access_token = jwt.sign(
            {
                account_id: account.id,
                user_id: account.customers ? account.customers?.id : account.staff?.id,
                role: account.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );

        return {
            access_token,
            refresh_token
        };
    }

    async refreshToken(oldRefreshToken) {
        const validator = new Validator();
        if (!validator.isEmpty("Refresh Token", oldRefreshToken))
            validator.isString("Refresh Token", oldRefreshToken);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const RefreshTokenRepo = new RefreshTokenRepository();
        const decoded = jwt.decode(oldRefreshToken);
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

        if (!process.env.JWT_SECRET) {
            throw new ValidationError('500', "JWT_SECRET is not defined in environment variables");
        }

        const refresh_token = jwt.sign(
            {
                account_id: account.id,
                user_id: account.customers ? account.customers?.id : account.staff?.id
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const createRefreshToken = await RefreshTokenRepo.createRefreshToken({
            account_id: account.id,
            token_hash: await bcrypt.hash(refresh_token, Number(process.env.SALT_ROUNDS) || 5),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });

        if (!createRefreshToken) {
            throw new ValidationError('500', "Failed to create refresh token");
        }

        const access_token = jwt.sign(
            {
                account_id: account.id,
                user_id: account.customers ? account.customers?.id : account.staff?.id,
                role: account.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );
        await RefreshTokenRepo.updateRefreshToken(validRefreshToken.id, { is_revoked: true });
        return {
            access_token,
            refresh_token: refresh_token
        };
    }

    async logout(refreshToken) {
        const validator = new Validator();
        if (!validator.isEmpty("Refresh Token", refreshToken))
            validator.isString("Refresh Token", refreshToken);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        const decoded = jwt.decode(refreshToken);
        const RefreshTokenRepo = new RefreshTokenRepository();
        const refreshTokens = await RefreshTokenRepo.getRefreshTokenByAccountId(decoded.account_id);
        const validRefreshToken = refreshTokens.find(token => token.expires_at > new Date() && !token.is_revoked);
        if (!validRefreshToken) {
            throw new ValidationError('404', "Refresh token not found");
        }
        await RefreshTokenRepo.updateRefreshToken(validRefreshToken.id, { is_revoked: true });
        return { message: "Logout successful" };
    };

    async registerStaffAccount(data) {
        const validatingAccountData = await AccountRepository.getValidatingInformation();
        const validator = new Validator();
        const validatedData = {
            ...(data.username && { username: data.username }),
            ...(data.password && { password: data.password }),
            ...(data.role && { role: data.role }),
            ...(data.status && { status: data.status }),
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.full_name && { full_name: data.full_name }),
            ...(data.phone && { phone: data.phone })
        };
        if (!validator.isEmpty("Username", validatedData.username))
            if (validator.isString("Username", validatedData.username)) {
                const existingAccount = validatingAccountData.find(account => account.username === validatedData.username);
                if (existingAccount) {
                    throw new ValidationError('409', "Account with this username already exists");
                }
                validatedData.username = validatedData.username.toLowerCase();
            }
        if (!validator.isEmpty("Password", validatedData.password))
            validator.validatePassword(validatedData.password)
        if (!validator.isEmpty("Role", validatedData.role))
            validator.validateAccountRole(validatedData.role)
        if (!validator.isEmpty("Status", validatedData.status))
            validator.validateAccountStatus(validatedData.status)
        if (!validator.isEmpty("Branch ID", validatedData.branch_id))
            validator.isUUID("Branch ID", validatedData.branch_id)
        if (!validator.isEmpty("Full Name", validatedData.full_name))
            validator.isString("Full Name", validatedData.full_name)
        if (!validator.isEmpty("Phone", validatedData.phone))
            validator.validatePhoneNumber(validatedData.phone)
        if (validator.error.length > 0)
            throw new ValidationError("400", validator.clearError());
        const branch = await BranchRepository.getBranchById(validatedData.branch_id);
        if (!branch) {
            throw new ValidationError("404", "Branch not found");
        }
        const existingPhoneNumber = validatingAccountData.find(account => account.staff?.phone === validatedData.phone);
        if (existingPhoneNumber) {
            throw new ValidationError("409", "Account with this phone number already exists");
        }
        validatedData.password_hash = await bcrypt.hash(validatedData.password, Number(process.env.SALT_ROUNDS) || 5);

        const result = prisma.$transaction(async (tx) => {
            const account = await tx.accounts.create({
                data: {
                    username: validatedData.username,
                    password_hash: validatedData.password_hash,
                    role: validatedData.role,
                    status: validatedData.status,
                    branch_id: validatedData.branch_id,
                }
            })
            if (!account) {
                throw new ValidationError("500", "Fail to create account");
            }
            const staff = await tx.staff.create({
                data: {
                    account_id: account.id,
                    branch_id: validatedData.branch_id,
                    full_name: validatedData.full_name,
                    phone: validatedData.phone,
                    position: validatedData.role
                }
            })
            if (!staff) {
                throw new ValidationError("500", "Fail to create staff");
            }
            return {
                message: "Create staff's account successfully",
                created_account: account,
                created_staff: staff
            }
        })

        return result;
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
            ...(data.password && { password: data.password }),
            ...(data.role && { role: data.role }),
            ...(data.status && { status: data.status }),
            ...(data.branch_id && { branch_id: data.branch_id }),
        };

        const validator = new Validator();
        if (validatedData.username) {
            if (!validator.isEmpty("Username", validatedData.username)) {
                if (validator.isString("Username", validatedData.username)) {
                    validatedData.username = validatedData.username.toLowerCase();
                }
            }
        }
        if (validatedData.password) {
            validator.isEmpty("Password", validatedData.password)
            validator.validatePassword(validatedData.password);
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

        validatedData.password_hash = await bcrypt.hash(validatedData.password, Number(process.env.SALT_ROUNDS) || 5);
        delete validatedData.password;

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
            validatedData.password_hash = await bcrypt.hash(validatedData.password_hash, Number(process.env.SALT_ROUNDS) || 5);
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
