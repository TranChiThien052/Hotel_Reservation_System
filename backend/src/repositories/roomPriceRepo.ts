import { prisma } from '../config/prisma';

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

    async getRoomPriceByBranchId(id) {
        return await prisma.room_prices.findMany({
            where: {
                room_types: {
                    branch_id: id
                }
            },
            select: {
                id: true,
                price_per_hour: true,
                price_per_day: true,
                effective_to: true,
                effective_from: true,
                weekend_rate: true,
                holiday_rate: true,
                room_types: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            }
        })
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
            include: {
                room_types: {
                    select: {
                        name: true,
                    }
                }
            }
        });
    };
}

export default new RoomPriceRepository();