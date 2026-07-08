import RoomAvailabilityRepository from '../repositories/roomAvailabilityRepo';
import RoomTypeRepository from '../repositories/roomTypeRepo';
import RoomPriceRepository from '../repositories/roomPriceRepo';
import HolidayDateRepository from '../repositories/holidayDateRepo';
import { Validator, ValidationError } from '../middlewares/validateData'

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

        // Get room types to check
        let roomTypes: any[] = [];
        if (roomTypeId) {
            const rt = await RoomTypeRepository.getRoomTypeById(roomTypeId);
            if (rt) roomTypes.push(rt);
        } else {
            const allTypes = await RoomTypeRepository.getAllRoomTypes();
            roomTypes = allTypes.filter((rt: any) => rt.branch_id === branchId);
        }

        if (numGuests) {
            roomTypes = roomTypes.filter((rt: any) => rt.max_guests >= numGuests);
        }

        // Fetch holidays for the branch
        const holidays = await HolidayDateRepository.getAllHolidayDates();
        const branchHolidays = holidays.filter((h: any) => h.branch_id === branchId || h.branch_id === null);
        const holidayDates = branchHolidays.map((h: any) => new Date(h.date).toDateString());

        const results: any[] = [];

        for (const rt of roomTypes) {
            const totalRooms = await RoomAvailabilityRepository.getPhysicalRoomCount(branchId, rt.id);
            const bookedCount = await RoomAvailabilityRepository.getOverlappingBookingCount(branchId, checkin, checkout, rt.id);

            const availableCount = totalRooms - bookedCount;

            const roomPrice = await RoomPriceRepository.getRoomPricesByRoomTypeId(rt.id);
            let estimatedTotal = 0;
            let pricePerUnit = 0;

            if (roomPrice) {
                const basePrice = bookingType === 'hourly' ? Number(roomPrice.price_per_hour) : Number(roomPrice.price_per_day);
                pricePerUnit = basePrice;

                // Calculate estimated total including weekends and holidays
                estimatedTotal = this.calculateDynamicPrice(checkin, checkout, basePrice, Number(roomPrice.weekend_rate), Number(roomPrice.holiday_rate), holidayDates, bookingType || 'daily');
            }
            const result_data = {
                room_type: {
                    id: rt.id,
                    name: rt.name,
                    max_guests: rt.max_guests,
                    images: rt.images
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

    calculateDynamicPrice(checkin, checkout, basePrice, weekendRate, holidayRate, holidayDates, bookingType) {
        let total = 0;

        if (bookingType === 'hourly') {
            const hours = Math.ceil(Math.abs(checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60));
            const checkinDateStr = checkin.toDateString();
            const dayOfWeek = checkin.getDay();

            let rate = 1.0;
            if (holidayDates.includes(checkinDateStr)) {
                rate = holidayRate;
            } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                rate = weekendRate;
            }
            return basePrice * rate * hours;
        }

        let currentDate = new Date(checkin);
        while (currentDate < checkout) {
            const dateStr = currentDate.toDateString();
            const dayOfWeek = currentDate.getDay();

            let rate = 1.0;
            if (holidayDates.includes(dateStr)) {
                rate = holidayRate;
            } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                rate = weekendRate;
            }

            total += basePrice * rate;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return total;
    }
}

export default new RoomAvailabilityService();
