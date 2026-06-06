import { prisma } from '../config/prisma';

class RoomRepository {
    async getAllRooms() {
        return await prisma.rooms.findMany();
    };

    async getRoomsByBranchId(id) {
        return await prisma.rooms.findMany({ where: { branch_id: id }});
    };

    async getRoomById(id) {
        return await prisma.rooms.findUnique({ where: { id: id }});
    };

    async createRoom(data) {
        return await prisma.rooms.create({ data: data });
    };

    async updateRoom(id, data) {
        return await prisma.rooms.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteRoom(id) {
        return await prisma.rooms.delete({ where: { id: id } });
    };
}

export default new RoomRepository();