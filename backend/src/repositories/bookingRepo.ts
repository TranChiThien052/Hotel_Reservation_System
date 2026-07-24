import { PrismaClient } from '@prisma/client';
import { prisma } from '../config/prisma';

class BookingRepository {
    async getAllBookings() {
        await prisma.bookings.updateMany({
            where: {
                status: "pending",
                expires_at: {
                    lt: new Date(),
                },
                payments: {
                    none: {
                        status: "paid",
                    },
                },
            },
            data: {
                status: "cancelled",
                notes: "Đã hủy vì không thanh toán cọc",
            },
        });
        return await prisma.bookings.findMany({
            include: {
                customers: true,
                room_types: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                branches: {
                    select: {
                        name: true,
                    }
                }
            }
        });
    };

    async getBookingById(id) {
        const booking = await prisma.bookings.findUnique({
            where: { id: id },
            include: {
                customers: true,
                room_types: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                branches: {
                    select: {
                        name: true,
                    }
                },
                payments: {
                    select: {
                        amount: true,
                        paid_at: true,
                        is_deposit: true,
                        transaction_ref: true,
                    },
                    where: {
                        status: 'paid',
                    }
                }
            }
        });
        if (booking?.expires_at && new Date(booking.expires_at).getTime() < Date.now()) {
            booking.status = 'cancelled';
            booking.notes = `${booking.notes}\nĐã hủy vì không thanh toán cọc`;
            await prisma.bookings.update({
                where: { id: id },
                data: {
                    status: booking.status,
                    notes: booking.notes,
                }
            })
        }
        return booking;
    };

    async getTodayCheckinCount(branch_id) {
        const today = new Date();
        const checkins = await prisma.bookings.findMany({
            where: {
                branch_id: branch_id,
                checkin_at: {
                    gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                    lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                },
                status: 'confirmed'
            },
            select: {
                id: true,
                booking_code: true,
                checkin_at: true,
                checkout_at: true,
                booking_type: true,
                status: true,
                num_guests: true,
                customers: {
                    select: {
                        full_name: true,
                        phone: true,
                    }
                },
                room_types: {
                    select: {
                        name: true,
                    }
                }
            }
        })
        const checkouts = await prisma.bookings.findMany({
            where: {
                branch_id: branch_id,
                checkout_at: {
                    gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                    lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
                },
                status: 'checked_in'
            },
            select: {
                id: true,
                booking_code: true,
                checkin_at: true,
                checkout_at: true,
                booking_type: true,
                status: true,
                num_guests: true,
                customers: {
                    select: {
                        full_name: true,
                        phone: true,
                    }
                },
                room_types: {
                    select: {
                        name: true,
                    }
                }
            }
        })
        const checkinsCount = checkins.length;
        const checkoutsCount = checkouts.length;

        return {
            checkinsCount,
            checkoutsCount,
            checkins,
            checkouts
        }
    }

    async getBookingByCode(code) {
        const booking = await prisma.bookings.findUnique({
            where: { booking_code: code },
            include: {
                customers: true,
                room_types: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                branches: {
                    select: {
                        name: true,
                    }
                }
            }
        });
        if (booking?.expires_at && new Date(booking.expires_at).getTime() < Date.now()) {
            booking.status = 'cancelled';
            booking.notes = `${booking.notes}\nĐã hủy vì không thanh toán cọc`;
            await prisma.bookings.update({
                where: { booking_code: code },
                data: {
                    status: booking.status,
                    notes: booking.notes,
                }
            })
        }
        return booking;
    };

    async getBookingsByBranchId(branchId) {
        await prisma.bookings.updateMany({
            where: {
                branch_id: branchId,
                status: "pending",
                expires_at: {
                    lt: new Date(),
                },
                payments: {
                    none: {
                        status: "paid",
                    },
                },
            },
            data: {
                status: "cancelled",
                notes: "Đã hủy vì không thanh toán cọc",
            },
        });
        return await prisma.bookings.findMany({
            where: { branch_id: branchId },
            include: {
                customers: true,
                room_types: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                branches: {
                    select: {
                        name: true,
                    }
                }
            }
        });
    };

    async getBookingsByCustomerId(customerId) {
        await prisma.bookings.updateMany({
            where: {
                customer_id: customerId,
                status: "pending",
                expires_at: {
                    lt: new Date(),
                },
                payments: {
                    none: {
                        status: "paid",
                    },
                },
            },
            data: {
                status: "cancelled",
                notes: "Đã hủy vì không thanh toán cọc",
            },
        });
        return await prisma.bookings.findMany({
            where: { customer_id: customerId },
            include: {
                customers: true,
                room_types: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                branches: {
                    select: {
                        name: true,
                    }
                }
            }
        });
    };

    async getBookingsByStatus(status) {
        await prisma.bookings.updateMany({
            where: {
                status: status,
                expires_at: {
                    lt: new Date(),
                },
                payments: {
                    none: {
                        status: "paid",
                    },
                },
            },
            data: {
                status: "cancelled",
                notes: "Đã hủy vì không thanh toán cọc",
            },
        });
        return await prisma.bookings.findMany({
            where: { status: status },
            include: {
                customers: true,
                room_types: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                branches: {
                    select: {
                        name: true,
                    }
                }
            }
        });
    };

    async getValidatingInformation() {
        return await prisma.bookings.findMany({
            select: {
                booking_code: true,
            },
        });
    };

    async createBookingWithOverlapChecking(booking_data) {
        return await prisma.$transaction(async (tx) => {
            const booking = await tx.bookings.create({ data: booking_data });

            const totalRooms = await tx.rooms.count({
                where: {
                    branch_id: booking_data.branch_id,
                    room_type_id: booking_data.room_type_id,
                    is_active: true,
                    status: { notIn: ['maintenance', 'unavailable'] }
                }
            });

            const bookedCount = await tx.bookings.count({
                where: {
                    branch_id: booking_data.branch_id,
                    room_type_id: booking_data.room_type_id,
                    status: { in: ['pending', 'confirmed', 'checked_in'] },
                    checkin_at: { lt: booking_data.checkout_at },
                    checkout_at: { gt: booking_data.checkin_at }
                }
            });

            if (bookedCount > totalRooms) {
                throw new Error("Overbooking detected: No rooms available for the selected dates.");
            }

            return booking;
        }, {
            isolationLevel: PrismaClient.TransactionIsolationLevel.Serializable
        })
    }

    async createBooking(data) {
        return await prisma.bookings.create({
            data: data,
        });
    };

    async updateBooking(id, data) {
        return await prisma.bookings.update({
            where: { id: id },
            data: data,
        });
    };

    async deleteBooking(id) {
        return await prisma.bookings.delete({
            where: { id: id },
        });
    };
}

export default new BookingRepository();
