import { prisma } from '../config/prisma.ts';

class DiscountRepository {
    async getAllDiscounts() {
        return await prisma.discounts.findMany({
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
            }
        });
    };

    async getDiscountById(id) {
        return await prisma.discounts.findUnique({
            where: { id: id },
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
            }
        });
    };

    async createDiscount(data) {
        return await prisma.discounts.create({
            data,
        });
    };

    async updateDiscount(id, data) {
        return await prisma.discounts.update({
            where: { id: id },
            data,
        });
    };

    async deleteDiscount(id) {
        return await prisma.discounts.delete({
            where: { id: id },
        });
    };
}

export default new DiscountRepository();