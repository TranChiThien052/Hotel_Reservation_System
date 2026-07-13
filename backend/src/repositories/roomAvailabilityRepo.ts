import { prisma } from '../config/prisma';

class RoomAvailabilityRepository {
    async getAvaibleRoomCount(branch_id, checkin, checkout, room_type_id?) {
        const roomCondition: any = {
            branch_id: branch_id,
            status: {
                notIn: ['unavailable', 'maintenance']
            },
            is_active: true
        }
        if (room_type_id) {
            roomCondition.room_type_id = room_type_id;
        }

        const roomCount = await prisma.rooms.count({
            where: roomCondition
        });

        const bookingCondition: any = {
            branch_id: branch_id,
            checkin_at: {
                lt: checkout
            },
            checkout_at: {
                gt: checkin
            },
            status: {
                notIn: ['cancelled', 'completed']
            }
        }
        if (room_type_id) {
            bookingCondition.room_type_id = room_type_id;
        }

        const bookingCount = await prisma.bookings.count({
            where: bookingCondition
        });

        return Number(roomCount - bookingCount);
    }

    async getPhysicalRoomCount(branch_id, room_type_id?) {
        const condition: any = {
            branch_id: branch_id,
            is_active: true,
            status: {
                in: ['available']
            }
        };

        if (room_type_id) {
            condition.room_type_id = room_type_id;
        }

        const count = await prisma.rooms.count({
            where: condition
        });

        return count;
    }

    async getOverlappingBookingCount(branchId: string, checkinAt: Date, checkoutAt: Date, roomTypeId?: string) {
        const whereClause: any = {
            branch_id: branchId,
            status: {
                notIn: ['cancelled', 'completed']
            },
            // overlap condition: booking.checkin_at < requested_checkout AND booking.checkout_at > requested_checkin
            checkin_at: {
                lt: checkoutAt
            },
            checkout_at: {
                gt: checkinAt
            }
        };

        if (roomTypeId) {
            whereClause.room_type_id = roomTypeId;
        }

        const count = await prisma.bookings.count({
            where: whereClause
        });

        return count;
    }
}

export default new RoomAvailabilityRepository();
