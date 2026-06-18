import { prisma } from '../config/prisma';

class AccountRepository {
    async getAllAccounts() {
        return await prisma.accounts.findMany();
    };

    async getAccountById(id) {
        return await prisma.accounts.findUnique({
            where: { id: id },
        });
    };

    async getAccountByUsername(username) {
        return await prisma.accounts.findUnique({
            where: { username: username },
        });
    };

    async getAccountsByBranchId(branchId) {
        return await prisma.accounts.findMany({
            where: { branch_id: branchId },
        });
    };

    async createAccount(data) {
        return await prisma.accounts.create({
            data: data,
        });
    };

    async updateAccount(id, data) {
        return await prisma.accounts.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteAccount(id) {
        return await prisma.accounts.delete({
            where: { id: id },
        });
    };

    async getValidatingInformation() {
        return await prisma.accounts.findMany({
            select: {
                id: true,
                username: true,
            }
        });
    }
}

export default new AccountRepository();
