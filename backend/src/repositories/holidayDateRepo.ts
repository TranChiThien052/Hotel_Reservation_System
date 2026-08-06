import { prisma } from '../config/prisma';

class HolidayDateRepository {
    async getAllHolidayDates() {
        return await prisma.holiday_dates.findMany({
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                }
            }
        });
    };

    async getHolidayDateById(id) {
        return await prisma.holiday_dates.findUnique({
            where: { id: id },
            include: {
                branches: {
                    select: {
                        name: true,
                    }
                }
            }
        });
    };

    async getHolidayDatesByBranchId(branchId) {
        return await prisma.holiday_dates.findMany({
            where: {
                OR: [
                    { branch_id: branchId },
                    { branch_id: null },
                ],
            },
            include: {
                branches: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    };

    async getHolidayDatesByDate(date) {
        return await prisma.holiday_dates.findMany({
            where: { date: date },
            include: {
                branches: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    };

    async createHolidayDate(data) {
        return await prisma.holiday_dates.create({
            data: data,
        });
    };

    async updateHolidayDate(id, data) {
        return await prisma.holiday_dates.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteHolidayDate(id) {
        return await prisma.holiday_dates.delete({
            where: { id: id },
        });
    };
}

export default new HolidayDateRepository();
