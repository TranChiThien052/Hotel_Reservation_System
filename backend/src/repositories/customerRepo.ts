import { prisma } from '../config/prisma.ts';

class CustomerRepository {
    async getAllCustomers() {
        return await prisma.customers.findMany();
    };

    async getCustomerById(id) {
        return await prisma.customers.findUnique({
            where: { id: id },
        });
    };

    async getCustomerByAccountId(accountId) {
        return await prisma.customers.findUnique({
            where: { account_id: accountId },
        });
    };
    
    async createCustomer(data) {
        return await prisma.customers.create({
            data: data,
        });
    };

    async updateCustomer(id, data) {
        return await prisma.customers.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteCustomer(id) {
        return await prisma.customers.delete({
            where: { id: id },
        });
    };

    async getValidatingInformation() {
        return await prisma.customers.findMany({
            select: {
                id: true,
                phone: true,
                email: true,
                id_card_number: true,
            },
        });
    }
}

export default new CustomerRepository();
