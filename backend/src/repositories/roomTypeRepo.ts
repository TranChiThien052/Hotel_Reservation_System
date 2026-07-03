import { prisma } from '../config/prisma';

class RoomTypeRepository {
    async getAllRoomTypes() {
        return await prisma.room_types.findMany({
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
                roomImages: {
                    select: {
                        image_url: true,
                        image_public_id: true,
                    }
                }
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
                roomImages: {
                    select: {
                        image_url: true,
                        image_public_id: true,
                    }
                }
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
                roomImages: {
                    select: {
                        image_url: true,
                        image_public_id: true,
                    }
                }
            }
        });
    };

    async createRoomType(data) {
        return await prisma.room_types.create({
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