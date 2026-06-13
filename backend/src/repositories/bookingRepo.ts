import { prisma } from '../config/prisma.ts';

class BookingRepository {
    async getAllBookings() {
        return await prisma.bookings.findMany();
    };

    async getBookingById(id) {
        return await prisma.bookings.findUnique({
            where: { id: id },
        });
    };

    async getBookingByCode(code) {
        return await prisma.bookings.findUnique({
            where: { booking_code: code },
        });
    };

    async getBookingsByBranchId(branchId) {
        return await prisma.bookings.findMany({
            where: { branch_id: branchId },
        });
    };

    async getBookingsByCustomerId(customerId) {
        return await prisma.bookings.findMany({
            where: { customer_id: customerId },
        });
    };

    async getBookingsByStatus(status) {
        return await prisma.bookings.findMany({
            where: { status: status },
        });
    };

    async getValidatingInformation() {
        return await prisma.bookings.findMany({
            select: {
                booking_code: true,
            },
        });
    };

    async createBooking(data) {
        return await prisma.bookings.create({
            data: data,
        });
    };

    async updateBooking(id, data) {
        return await prisma.bookings.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteBooking(id) {
        return await prisma.bookings.delete({
            where: { id: id },
        });
    };
}

export default new BookingRepository();
