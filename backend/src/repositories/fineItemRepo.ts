import { prisma } from '../config/prisma';

class FineItemRepository {
    async getAllFineItems() {
        return await prisma.fine_items.findMany();
    };

    async getFineItemById(id) {
        return await prisma.fine_items.findUnique({
            where: { id: id },
        });
    };

    async getFineItemsByBranchId(branchId) {
        return await prisma.fine_items.findMany({
            where: { branch_id: branchId },
        });
    };

    async createFineItem(data) {
        return await prisma.fine_items.create({
            data: data,
        });
    };

    async updateFineItem(id, data) {
        return await prisma.fine_items.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteFineItem(id) {
        return await prisma.fine_items.delete({
            where: { id: id },
        });
    };
}

export default new FineItemRepository();
