import { prisma } from '../config/prisma.ts';

class HistoryTransactionRepository {
    async getAllTransactions() {
        return await prisma.history_transaction.findMany({
            orderBy: { created_at: 'desc' },
        });
    };

    async getTransactionById(id) {
        return await prisma.history_transaction.findUnique({
            where: { id: id },
        });
    };

    async getTransactionsByAccountId(accountId) {
        return await prisma.history_transaction.findMany({
            where: { account_id: accountId },
            orderBy: { created_at: 'desc' },
        });
    };

    async getTransactionsByTargetType(targetType) {
        return await prisma.history_transaction.findMany({
            where: { target_type: targetType },
            orderBy: { created_at: 'desc' },
        });
    };

    async createTransaction(data) {
        return await prisma.history_transaction.create({
            data: data,
        });
    };

    async deleteTransaction(id) {
        return await prisma.history_transaction.delete({
            where: { id: id },
        });
    };
}

export default new HistoryTransactionRepository();
