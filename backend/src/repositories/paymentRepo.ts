import { prisma } from '../config/prisma';

class PaymentRepository {
    async getAllPayments() {
        return await prisma.payments.findMany();
    };

    async getPaymentById(id) {
        return await prisma.payments.findUnique({
            where: { id: id },
        });
    };

    async getPaymentsByBookingId(bookingId) {
        return await prisma.payments.findMany({
            where: { booking_id: bookingId },
        });
    };

    async getPaymentsByInvoiceId(invoiceId) {
        return await prisma.payments.findMany({
            where: { invoice_id: invoiceId },
        });
    };

    async getPaymentsByStatus(status) {
        return await prisma.payments.findMany({
            where: { status: status },
        });
    };

    async createPayment(data) {
        return await prisma.payments.create({
            data: data,
        });
    };

    async updatePayment(id, data) {
        return await prisma.payments.update({
            where: { id: id },
            data: data,
        });
    };

    async deletePayment(id) {
        return await prisma.payments.delete({
            where: { id: id },
        });
    };

    async getPaymentByTransactionRef(transactionRef) {
        return await prisma.payments.findFirst({
            where: { transaction_ref: transactionRef },
        });
    };
}

export default new PaymentRepository();
