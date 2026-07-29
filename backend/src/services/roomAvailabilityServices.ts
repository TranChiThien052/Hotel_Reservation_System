import RoomAvailabilityRepository from '../repositories/roomAvailabilityRepo';
import RoomTypeRepository from '../repositories/roomTypeRepo';
import RoomPriceRepository from '../repositories/roomPriceRepo';
import HolidayDateRepository from '../repositories/holidayDateRepo';
import { Validator, ValidationError } from '../middlewares/validateData'
import { calculateDynamicPrice } from '../middlewares/generator';

class RoomAvailabilityService {
    async getAvailableRoomCount(branch_id, checkin, checkout, room_type_id?) {
        const validator = new Validator();
        if (!validator.isEmpty("Branch ID", branch_id))
            validator.isUUID("Branch ID", branch_id);
        if (room_type_id)
            validator.isUUID("Room Type ID", room_type_id);
        if (!validator.isEmpty("Checkin", checkin) && !validator.isEmpty("Checkout", checkout))
            validator.validateDateOrder(checkin, checkout);
        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        return await RoomAvailabilityRepository.getAvaibleRoomCount(branch_id, new Date(checkin), new Date(checkout), room_type_id);
    }

    async searchAvailableRooms(branchId: string, checkinAt: string, checkoutAt: string, roomTypeId?: string, numGuests?: number, bookingType?: string) {
        const checkin = new Date(checkinAt);
        const checkout = new Date(checkoutAt);

        let roomTypes: any[] = [];
        if (roomTypeId) {
            const roomType = await RoomTypeRepository.getRoomTypeById(roomTypeId);
            if (roomType) roomTypes.push(roomType);
        } else {
            roomTypes = await RoomTypeRepository.getRoomTypesByBranchId(branchId);
        }

        if (numGuests) {
            roomTypes = roomTypes.filter((roomType: any) => roomType.max_guests >= numGuests);
        }

        const holidays = await HolidayDateRepository.getHolidayDatesByBranchId(branchId);
        const holidayDates = holidays.map((holiday) => new Date(holiday.date).toDateString());

        const results: any[] = [];

        for (const roomType of roomTypes) {
            const totalRooms = await RoomAvailabilityRepository.getPhysicalRoomCount(branchId, roomType.id);
            const bookedCount = await RoomAvailabilityRepository.getOverlappingBookingCount(branchId, checkin, checkout, roomType.id);

            const availableCount = totalRooms - bookedCount;

            const roomPrice = await RoomPriceRepository.getRoomPricesByRoomTypeId(roomType.id);
            let estimatedTotal = 0;
            let pricePerUnit = 0;

            if (roomPrice) {
                const basePrice = bookingType === 'hourly' ? Number(roomPrice.price_per_hour) : Number(roomPrice.price_per_day);
                pricePerUnit = basePrice;

                estimatedTotal = calculateDynamicPrice(checkin, checkout, basePrice, Number(roomPrice.weekend_rate), Number(roomPrice.holiday_rate), holidayDates, bookingType || 'daily');
            }
            const result_data = {
                room_type: {
                    id: roomType.id,
                    name: roomType.name,
                    max_guests: roomType.max_guests,
                    images: roomType.images
                },
                total_rooms: totalRooms,
                booked_count: bookedCount,
                available_count: availableCount,
                is_sold_out: availableCount <= 0,
                price_per_unit: pricePerUnit,
                estimated_total: estimatedTotal
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
