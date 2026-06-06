import { prisma } from '../config/prisma.ts';

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
}

export default new BranchRepository();