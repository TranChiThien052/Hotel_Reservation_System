import { prisma } from '../config/prisma.ts';

class RoomServiceRepository {
    async getAllServices() {
        return await prisma.services.findMany();
    };

    async getServiceById(id) {
        return await prisma.services.findUnique({ where: { id } });
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