import { prisma } from '../config/prisma';

class BranchRepository {
    async getAllBranches() {
        return await prisma.branches.findMany();
    };

    async getBranchById(id) {
        return await prisma.branches.findUnique({
            where: { id: id },
        });
    };

    async createBranch(data) {
        return await prisma.branches.create({
            data: data,
        });
    };

    async updateBranch(id, data) {
        return await prisma.branches.update({
            where: { id },
            data: data,
        });
    };

    async deleteBranch(id) {
        return await prisma.branches.delete({ where: { id: id } });
    };

    async getValidatingInformation() {
        return await prisma.branches.findMany({
            select: {
                id: true,
                email: true,
                phone: true,
            },
        });
    };
}

export default new BranchRepository();