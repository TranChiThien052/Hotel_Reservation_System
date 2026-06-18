import { prisma } from '../config/prisma';

class BookingServiceRepository {
    async getAllBookingServices() {
        return await prisma.booking_services.findMany();
    };

    async getBookingServiceById(id) {
        return await prisma.booking_services.findUnique({
            where: { id: id },
        });
    };

    async getBookingServicesByBookingId(bookingId) {
        return await prisma.booking_services.findMany({
            where: { booking_id: bookingId },
            include: {
                services: {
                    select: {
                        name: true,
                        price: true,
                    },
                },
            }
        });
    };

    async getBookingServicesByServiceId(serviceId) {
        return await prisma.booking_services.findMany({
            where: { service_id: serviceId },
        });
    };

    async createBookingService(data) {
        return await prisma.booking_services.create({
            data: data,
        });
    };

    async updateBookingService(id, data) {
        return await prisma.booking_services.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteBookingService(id) {
        return await prisma.booking_services.delete({
            where: { id: id },
        });
    };
}

export default new BookingServiceRepository();
