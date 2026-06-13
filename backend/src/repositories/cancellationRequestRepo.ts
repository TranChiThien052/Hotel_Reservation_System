import { prisma } from '../config/prisma.ts';

class CancellationRequestRepository {
    async getAllCancellationRequests() {
        return await prisma.cancellation_requests.findMany();
    };

    async getCancellationRequestById(id) {
        return await prisma.cancellation_requests.findUnique({
            where: { id: id },
        });
    };

    async getCancellationRequestsByBookingId(bookingId) {
        return await prisma.cancellation_requests.findMany({
            where: { booking_id: bookingId },
        });
    };

    async getCancellationRequestsByStatus(status) {
        return await prisma.cancellation_requests.findMany({
            where: { status: status },
        });
    };

    async createCancellationRequest(data) {
        return await prisma.cancellation_requests.create({
            data: data,
        });
    };

    async updateCancellationRequest(id, data) {
        return await prisma.cancellation_requests.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteCancellationRequest(id) {
        return await prisma.cancellation_requests.delete({
            where: { id: id },
        });
    };
}

export default new CancellationRequestRepository();
