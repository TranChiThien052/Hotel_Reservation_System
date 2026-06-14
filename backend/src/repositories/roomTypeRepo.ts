import { prisma } from '../config/prisma.ts';

class RoomTypeRepository {
    async getAllRoomTypes() {
        return await prisma.room_types.findMany({
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
            }
        });
    };

    async getRoomTypeById(id) {
        return await prisma.room_types.findUnique({
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

    async getRoomTypesByBranchId(branchId) {
        return await prisma.room_types.findMany({
            where: { branch_id: branchId },
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
            }
        });
    };

    async createRoomType(data) {
        return await prisma.room_types .create({
            data: data,
        });
    };

    async updateRoomType(id, data) {
        return await prisma.room_types.update({
            where: { id },
            data: data,
        });
    };

    async deleteRoomType(id) {
        return await prisma.room_types.delete({ where: { id: id } });
    };
}

export default new RoomTypeRepository();