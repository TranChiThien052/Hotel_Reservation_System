import { prisma } from '../config/prisma.ts';

class RoomPriceRepository {
    async getAllRoomPrices() {
        return await prisma.room_prices.findMany();
    };

    async getRoomPriceById(id) {
        return await prisma.room_prices.findUnique({ where: { id } });
    };

    async getRoomPricesByRoomTypeId(room_type_id) {
        return await prisma.room_prices.findMany({ where: { room_type_id } });
    };

    async createRoomPrice(data) {
        return await prisma.room_prices.create({ data });
    };

    async updateRoomPrice(id, data) {
        return await prisma.room_prices.update({ where: { id }, data });
    };

    async deleteRoomPrice(id) {
        return await prisma.room_prices.delete({ where: { id } });
    };
}

export default new RoomPriceRepository();