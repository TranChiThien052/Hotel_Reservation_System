import { prisma } from '../config/prisma.ts';

class InvoiceFineRepository {
    async getAllInvoiceFines() {
        return await prisma.invoice_fines.findMany();
    };

    async getInvoiceFineById(id) {
        return await prisma.invoice_fines.findUnique({
            where: { id: id },
        });
    };

    async getInvoiceFinesByInvoiceId(invoiceId) {
        return await prisma.invoice_fines.findMany({
            where: { invoice_id: invoiceId },
        });
    };

    async getInvoiceFinesByFineItemId(fineItemId) {
        return await prisma.invoice_fines.findMany({
            where: { fine_item_id: fineItemId },
        });
    };

    async createInvoiceFine(data) {
        return await prisma.invoice_fines.create({
            data: data,
        });
    };

    async updateInvoiceFine(id, data) {
        return await prisma.invoice_fines.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteInvoiceFine(id) {
        return await prisma.invoice_fines.delete({
            where: { id: id },
        });
    };
}

export default new InvoiceFineRepository();
