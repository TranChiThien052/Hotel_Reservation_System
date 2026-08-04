import { prisma } from '../config/prisma';
import { payment_method, payment_status } from '../generated/prisma/enums';
import bookingServices from '../services/bookingServices';

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

    async getRevenue(start, end, branch_id?) {
        const condition: any = {};
        condition.paid_at = {
            lte: end,
            gte: start,
        }
        condition.status = payment_status.paid;
        if (branch_id) {
            condition.bookings = {};
            condition.bookings.branch_id = branch_id;
        }
        const payments = await prisma.payments.findMany({
            where: condition
        });
        const actual_revenue = payments.reduce((acc, curr) => {
            acc += Number(curr.amount);
            return acc;
        }, 0);
        const cash = payments.reduce((acc, curr) => {
            if (curr.payment_method === payment_method.cash)
                acc += Number(curr.amount);
            return acc;
        }, 0);
        const bank_transfer = payments.reduce((acc, curr) => {
            if (curr.payment_method === payment_method.bank_transfer)
                acc += Number(curr.amount);
            return acc;
        }, 0);
        const deposit = payments.reduce((acc, curr) => {
            if (curr.is_deposit)
                acc += Number(curr.amount);
            return acc;
        }, 0)
        return {
            actual_revenue,
            cash_revenue: cash,
            bank_transfer_revenue: bank_transfer,
            deposit_revenue: deposit,
        };
    }
}

export default new PaymentRepository();
