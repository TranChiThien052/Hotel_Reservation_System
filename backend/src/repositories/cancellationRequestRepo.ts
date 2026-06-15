import { prisma } from '../config/prisma.ts';

class CancellationRequestRepository {
    async getAllCancellationRequests() {
        return await prisma.cancellation_requests.findMany({
            include: {
                bookings: true,
            }
        });
    };

    async getCancellationRequestById(id) {
        return await prisma.cancellation_requests.findUnique({
            where: { id: id },
            include: {
                bookings: true,
            }
        });
    };

    async getCancellationRequestsByBookingId(bookingId) {
        return await prisma.cancellation_requests.findMany({
            where: { booking_id: bookingId },
            include: {
                bookings: true,
            }
        });
    };

    async getCancellationRequestsByStatus(status) {
        return await prisma.cancellation_requests.findMany({
            where: { status: status },
            include: {
                bookings: true,
            }
        });
    };

    async createCancellationRequest(data) {
        return await prisma.cancellation_requests.create({
            data: data,
            include: {
                bookings: true,
            }
        });
    };

    async updateCancellationRequest(id, data) {
        return await prisma.cancellation_requests.update({
            where: { id: id },
            data: data,
            include: {
                bookings: true,
            }
        });
    };

    async deleteCancellationRequest(id) {
        return await prisma.cancellation_requests.delete({
            where: { id: id },
            include: {
                bookings: true,
            }
        });
    };
}

export default new CancellationRequestRepository();
