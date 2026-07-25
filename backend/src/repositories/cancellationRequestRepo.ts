import { prisma } from '../config/prisma';

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

    async getCancellationRequestByBranchId(branch_id) {
        return await prisma.cancellation_requests.findMany({
            where: { bookings: { branch_id: branch_id } },
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
        return await prisma.$transaction(async (tx) => {
            const before = await tx.cancellation_requests.findUnique({
                where: { id: id }
            })
            const updatedCancellationRequest = await tx.cancellation_requests.update({
                where: { id: id },
                data: data,
                include: {
                    bookings: true,
                }
            });
            const { bookings, ...after } = updatedCancellationRequest;
            const changes = Object.keys(data);
            const history = await tx.history_transaction.create({
                data: {
                    action: 'Update',
                    account_id: updatedCancellationRequest.resolved_by,
                    target_type: "Cancellation request",
                    target_id: updatedCancellationRequest.id,
                    description: `Cancellation request updated by account with id ${updatedCancellationRequest.resolved_by}`,
                    metadata: {
                        before: before,
                        after: after,
                        updated_fields: changes,
                    },
                }
            });
            if (data.status === 'confirmed') {
                const beforeBooking = await tx.bookings.findUnique({
                    where: { id: updatedCancellationRequest.booking_id },
                })
                const booking = await tx.bookings.update({
                    where: { id: updatedCancellationRequest.booking_id },
                    data: {
                        status: 'cancelled',
                        updated_at: new Date(),
                    }
                });
                await tx.history_transaction.create({
                    data: {
                        action: 'Update',
                        account_id: updatedCancellationRequest.resolved_by,
                        target_type: "Booking",
                        target_id: updatedCancellationRequest.booking_id,
                        description: `Booking updated by account with id ${updatedCancellationRequest.resolved_by}`,
                        metadata: {
                            before: beforeBooking,
                            after: booking,
                            updated_fields: ['status'],
                        },
                    }
                });
            }
            return await tx.cancellation_requests.findUnique({
                where: { id: id },
                include: {
                    bookings: true,
                }
            });
        })
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
