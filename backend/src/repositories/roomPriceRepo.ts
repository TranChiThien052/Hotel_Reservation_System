import { prisma } from '../config/prisma.ts';

class RoomPriceRepository {
    async getAllRoomPrices() {
        return await prisma.room_prices.findMany({
            include: {
                room_types: {
                    select: {
                        name: true,
                    }
                },
            }
        });
    };
    async getRoomPriceById(id) {
        return await prisma.room_prices.findUnique({ 
            where: { id },
            include: {
                room_types: {
                    select: {
                        name: true,
                    }
                },
            }
        });
    };

    async getRoomPricesByRoomTypeId(id) {
        return await prisma.room_prices.findFirst({ 
            where: { room_type_id: id },
            include: {
                room_types: {
                    select: {
                        name: true,
                    }
                },
            }
        });
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

    async getValidatingInformation() {
        return await prisma.room_prices.findMany({
            select: {
                id: true,
                room_type_id: true,
                include: {
                    room_types: {
                        select: {
                            name: true,
                        }
                    }
                }
            },
        });
    };
}

export default new RoomPriceRepository();