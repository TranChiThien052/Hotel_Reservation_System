import { prisma } from '../config/prisma';

class HolidayDateRepository {
    async getAllHolidayDates() {
        return await prisma.holiday_dates.findMany();
    };

    async getHolidayDateById(id) {
        return await prisma.holiday_dates.findUnique({
            where: { id: id },
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
        });
    };

    async getHolidayDatesByDate(date) {
        return await prisma.holiday_dates.findMany({
            where: { date: date },
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
