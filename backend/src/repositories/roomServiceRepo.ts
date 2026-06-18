import { prisma } from '../config/prisma';

class RoomServiceRepository {
    async getAllServices() {
        return await prisma.services.findMany({
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
            }
        });
    };

    async getServiceById(id) {
        return await prisma.services.findUnique({
            where: { id },
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
            }
        });
    };

    async createService(data) {
        return await prisma.services.create({ data });
    };

    async updateService(id, data) {
        return await prisma.services.update({ where: { id }, data });
    };

    async deleteService(id) {
        return await prisma.services.delete({ where: { id } });
    };
}

export default new RoomServiceRepository();