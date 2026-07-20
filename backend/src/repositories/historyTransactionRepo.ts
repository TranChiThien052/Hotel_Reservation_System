import { prisma } from '../config/prisma';

class HistoryTransactionRepository {
    async getAllTransactions() {
        return await prisma.history_transaction.findMany({
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                action: true,
                target_type: true,
                target_id: true,
                description: true,
                metadata: true,
                created_at: true,
                accounts: {
                    select: {
                        id: true,
                        customers: {
                            select: {
                                full_name: true,
                            }
                        },
                        staff: {
                            select: {
                                full_name: true,
                            }
                        },
                        branches: {
                            select: {
                                name: true,
                            }
                        },
                        role: true,
                    }
                }
            }
        });
    };

    async getTransactionByBranchId(id) {
        return await prisma.history_transaction.findMany({
            where: { accounts: { branch_id: id } },
            select: {
                id: true,
                action: true,
                target_type: true,
                target_id: true,
                description: true,
                metadata: true,
                created_at: true,
                accounts: {
                    select: {
                        id: true,
                        customers: {
                            select: {
                                full_name: true,
                            }
                        },
                        staff: {
                            select: {
                                full_name: true,
                            }
                        },
                        branches: {
                            select: {
                                name: true,
                            }
                        },
                        role: true,
                    }
                }
            }
        });
    }

    async getTransactionById(id) {
        return await prisma.history_transaction.findUnique({
            where: { id: id },
            select: {
                id: true,
                action: true,
                target_type: true,
                target_id: true,
                description: true,
                metadata: true,
                created_at: true,
                accounts: {
                    select: {
                        id: true,
                        customers: {
                            select: {
                                full_name: true,
                            }
                        },
                        staff: {
                            select: {
                                full_name: true,
                            }
                        },
                        branches: {
                            select: {
                                name: true,
                            }
                        },
                        role: true,
                    }
                }
            }
        });
    };

    async getTransactionsByAccountId(accountId) {
        return await prisma.history_transaction.findMany({
            where: { account_id: accountId },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                action: true,
                target_type: true,
                target_id: true,
                description: true,
                metadata: true,
                created_at: true,
                accounts: {
                    select: {
                        id: true,
                        customers: {
                            select: {
                                full_name: true,
                            }
                        },
                        staff: {
                            select: {
                                full_name: true,
                            }
                        },
                        branches: {
                            select: {
                                name: true,
                            }
                        },
                        role: true,
                    }
                }
            }
        });
    };

    async getTransactionsByTargetType(target_type) {
        return await prisma.history_transaction.findMany({
            where: { target_type: target_type },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                action: true,
                target_type: true,
                target_id: true,
                description: true,
                metadata: true,
                created_at: true,
                accounts: {
                    select: {
                        id: true,
                        customers: {
                            select: {
                                full_name: true,
                            }
                        },
                        staff: {
                            select: {
                                full_name: true,
                            }
                        },
                        branches: {
                            select: {
                                name: true,
                            }
                        },
                        role: true,
                    }
                }
            }
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
