import { prisma } from '../config/prisma';

class AccountRepository {
    async getAllAccounts() {
        return await prisma.accounts.findMany({
            include: {
                branches: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                staff: {
                    select: {
                        id: true,
                        full_name: true,
                    }
                },
                customers: {
                    select: {
                        id: true,
                        full_name: true,
                    }
                }
            }
        });
    };

    async getAccountById(id) {
        return await prisma.accounts.findUnique({
            where: { id: id },
            include: {
                branches: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                staff: {
                    select: {
                        id: true,
                        full_name: true,
                    }
                },
                customers: {
                    select: {
                        id: true,
                        full_name: true,
                    }
                }
            }
        });
    };

    async getAccountByUsername(username) {
        return await prisma.accounts.findUnique({
            where: { username: username },
            include: {
                branches: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                staff: {
                    select: {
                        id: true,
                    }
                },
                customers: {
                    select: {
                        id: true,
                    }
                }
            }
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
            include: {
                branches: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                staff: {
                    select: {
                        id: true,
                        full_name: true,
                        phone: true,
                    }
                }
            }
        });
    }
}

export default new AccountRepository();
