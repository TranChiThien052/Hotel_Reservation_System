import RoomAvailabilityRepository from '../repositories/roomAvailabilityRepo';
import { Validator, ValidationError } from '../middlewares/validateData'
import { calculateDynamicPrice } from '../middlewares/generator';
import roomRepo from '../repositories/roomRepo';
import branchServices from './branchServices';
import roomTypeServices from './roomTypeServices';
import holidayDateServices from './holidayDateServices';
import roomPriceServices from './roomPriceServices';

class RoomAvailabilityService {
    async getAvailableRoomCount(branch_id, checkin, checkout, room_type_id?) {
        const validator = new Validator();
        const branch = await branchServices.getBranchById(branch_id);
        if (!branch)
            throw new ValidationError("404", "Branch not found");
        if (room_type_id) {
            const roomType = await roomTypeServices.getRoomTypeById(room_type_id);
            if (!roomType)
                throw new ValidationError("404", "Room Type not found");
        }
        if (!validator.isEmpty("Checkin", checkin) && !validator.isEmpty("Checkout", checkout))
            validator.validateDateOrder(checkin, checkout);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        return await RoomAvailabilityRepository.getAvaibleRoomCount(branch_id, new Date(checkin), new Date(checkout), room_type_id);
    }

    async searchAvailableRooms(branchId, checkinAt, checkoutAt, roomTypeId?, numGuests?, bookingType?) {
        const checkin = new Date(checkinAt);
        const checkout = new Date(checkoutAt);

        let roomTypes: any[] = [];
        if (roomTypeId) {
            const roomType = await roomTypeServices.getRoomTypeById(roomTypeId);
            if (roomType) roomTypes.push(roomType);
        } else {
            roomTypes = await roomTypeServices.getRoomTypesByBranchId(branchId);
        }

        if (numGuests) {
            roomTypes = roomTypes.filter((roomType: any) => roomType.max_guests >= numGuests);
        }

        // const holidays = await holidayDateServices.getHolidayDatesByBranchId(branchId);
        // const holidayDates = holidays.map((holiday) => new Date(holiday.date).toDateString());

        const results: any[] = [];

        for (const roomType of roomTypes) {
            const totalRooms = await RoomAvailabilityRepository.getPhysicalRoomCount(branchId, roomType.id);
            const bookedCount = await RoomAvailabilityRepository.getOverlappingBookingCount(branchId, checkin, checkout, roomType.id);
            const rooms = (await roomRepo.getRoomsByRoomTypeId(roomType.id)).filter(room => room.status === 'available');
            const availableRooms = rooms.map(room => {
                return {
                    id: room.id,
                    room_number: room.room_number,
                }
            });
            const availableCount = totalRooms - bookedCount;

            // const roomPrice = await roomPriceServices.getRoomPricesByRoomTypeId(roomType.id);
            // let estimatedTotal = 0;
            // let pricePerUnit = 0;

            // if (roomPrice) {
            //     const basePrice = bookingType === 'hourly' ? Number(roomPrice.price_per_hour) : Number(roomPrice.price_per_day);
            //     pricePerUnit = basePrice;

            //     estimatedTotal = calculateDynamicPrice(checkin, checkout, basePrice, Number(roomPrice.weekend_rate), Number(roomPrice.holiday_rate), holidayDates, bookingType || 'daily');
            // }
            const result_data = {
                room_type: {
                    id: roomType.id,
                    name: roomType.name,
                    max_guests: roomType.max_guests,
                    images: roomType.images,
                    availble_rooms: availableRooms,
                },
                total_rooms: totalRooms,
                booked_count: bookedCount,
                available_count: availableCount,
                is_sold_out: availableCount <= 0,
                // price_per_unit: pricePerUnit,
                // estimated_total: estimatedTotal
            };
            results.push(result_data);
        }

        return {
            branch_id: branchId,
            checkin_at: checkinAt,
            checkout_at: checkoutAt,
            booking_type: bookingType,
            results
        };
    }
}

export default new RoomAvailabilityService();
