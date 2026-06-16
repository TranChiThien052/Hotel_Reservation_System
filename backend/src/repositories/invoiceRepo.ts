import { prisma } from '../config/prisma.ts';

class InvoiceRepository {
    async getAllInvoices() {
        return await prisma.invoices.findMany();
    };

    async getInvoiceById(id) {
        return await prisma.invoices.findUnique({
            where: { id: id },
        });
    };

    async getInvoiceByCode(code) {
        return await prisma.invoices.findUnique({
            where: { invoice_code: code },
        });
    };

    async getInvoicesByBookingId(bookingId) {
        return await prisma.invoices.findMany({
            where: { booking_id: bookingId },
        });
    };

    async createInvoice(data) {
        return await prisma.invoices.create({
            data: data,
        });
    };

    async getAllCode() {
        const invoices = await prisma.invoices.findMany({
            select: { invoice_code: true },
        });
        return invoices.map(inv => inv.invoice_code);
    }

    async updateInvoice(id, data) {
        return await prisma.invoices.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteInvoice(id) {
        return await prisma.invoices.delete({
            where: { id: id },
        });
    };
}

export default new InvoiceRepository();
