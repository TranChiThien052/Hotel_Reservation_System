import { prisma } from '../config/prisma';

class RoomRepository {
    async getAllRooms() {
        return await prisma.rooms.findMany({
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
                room_types: true,
            }
        });
    };

    async getRoomsByRoomTypeId(id) {
        return await prisma.rooms.findMany({
            where: {
                room_type_id: id,
            },
            orderBy: {
                room_number: 'asc'
            }
        })
    }

    async getRoomsByBranchId(id) {
        return await prisma.rooms.findMany({
            where: {
                branch_id: id
            },
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
                room_types: true,
            }
        });
    };

    async getRoomById(id) {
        return await prisma.rooms.findUnique({
            where: { id: id },
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
                room_types: true,
            }
        });
    };

    async createRoom(data) {
        return await prisma.rooms.create({ data: data });
    };

    async updateRoom(id, data) {
        return await prisma.rooms.update({
            where: { id: id },
            data: data,
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                },
                room_types: true,
            }
        });
    };

    async deleteRoom(id) {
        return await prisma.rooms.delete({ where: { id: id } });
    };
}

export default new RoomRepository();