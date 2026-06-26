import { prisma } from '../config/prisma';

class StaffRepository {
    async getAllStaff() {
        return await prisma.staff.findMany({
            include: {
                accounts: {
                    select: {
                        id: true,
                        username: true,
                        status: true,
                        branch_id: true,
                    },
                },
            },
        });
    };

    async getStaffById(id) {
        return await prisma.staff.findUnique({
            where: { id: id },
            include: {
                accounts: {
                    select: {
                        id: true,
                        username: true,
                        status: true,
                        branch_id: true,
                    },
                },
            },
        });
    };

    async getStaffByAccountId(accountId) {
        return await prisma.staff.findUnique({
            where: { account_id: accountId },
            include: {
                accounts: {
                    select: {
                        id: true,
                        username: true,
                        status: true,
                        branch_id: true,
                    },
                },
            },
        });
    };

    async getStaffByBranchId(branchId) {
        return await prisma.staff.findMany({
            where: { branch_id: branchId },
            include: {
                accounts: {
                    select: {
                        id: true,
                        username: true,
                        status: true,
                        branch_id: true,
                    },
                },
            },
        });
    };

    async createStaff(data) {
        return await prisma.staff.create({
            data: data,
        });
    };

    async updateStaff(id, data) {
        return await prisma.staff.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteStaff(id) {
        return await prisma.staff.delete({
            where: { id: id },
        });
    };

    async getValidatingInformation() {
        return await prisma.staff.findMany({
            select: {
                id: true,
                phone: true,
            }
        });
    }
}

export default new StaffRepository();
