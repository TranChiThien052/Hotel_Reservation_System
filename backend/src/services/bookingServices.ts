import BookingRepository from '../repositories/bookingRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';
import { generateBookingCode, generateDayDiff, generateDiscountAmount, generateHourDiff } from '../middlewares/generator.ts';
import DiscountRepository from '../repositories/discountRepo.ts';

class BookingService {
    async getAllBookings() {
        return await BookingRepository.getAllBookings();
    };

    async getBookingById(id) {
        return await BookingRepository.getBookingById(id);
    };

    async createBooking(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id.trim() }),
            ...(data.customer_id && { customer_id: data.customer_id.trim() }),
            ...(data.room_type_id && { room_type_id: data.room_type_id.trim() }),
            ...(data.assigned_room_id && { assigned_room_id: data.assigned_room_id.trim() }),
            ...(data.booking_type && { booking_type: data.booking_type.trim() }),
            ...(data.checkin_at && { checkin_at: data.checkin_at }),
            ...(data.checkout_at && { checkout_at: data.checkout_at }),
            ...(data.num_guests && { num_guests: data.num_guests }),
            ...(data.room_price_snapshot && { room_price_snapshot: data.room_price_snapshot }),
            ...(data.discount_id && { discount_id: data.discount_id.trim() }),
            ...(data.created_by && { created_by: data.created_by.trim() }),
            ...(data.notes && { notes: data.notes.trim() }),
        };

        const validator = new Validator();
        if(!validator.isEmpty("Branch ID", validatedData.branch_id))
            validator.isUUID("Branch ID", validatedData.branch_id);
        if(!validator.isEmpty("Customer ID", validatedData.customer_id))
            validator.isUUID("Customer ID", validatedData.customer_id);
        if(!validator.isEmpty("Room Type ID", validatedData.room_type_id))
            validator.isUUID("Room Type ID", validatedData.room_type_id);
        if(!validator.isEmpty("Booking Type", validatedData.booking_type))
            validator.validateBookingType(validatedData.booking_type);
        if(!validator.isEmpty("Checkin At", validatedData.checkin_at))
            validator.validateDate(validatedData.checkin_at);
        if(!validator.isEmpty("Checkout At", validatedData.checkout_at))
            validator.validateDate(validatedData.checkout_at);

        if(validator.validateDateOrder(validatedData.checkin_at, validatedData.checkout_at)) 
            if(new Date(validatedData.checkin_at) < new Date())
                validator.pushError("Check-in date must be in the future");

        if(validatedData.assigned_room_id) {
            validator.isUUID("Assigned Room ID", validatedData.assigned_room_id);
        }
        if(validatedData.num_guests) {
            validator.isPositiveNumber("Number of Guests", validatedData.num_guests);
        }
        if(validatedData.room_price_snapshot) {
            validator.isDecimal("Room Price Snapshot", validatedData.room_price_snapshot);
            validator.isNonNegativeNumber("Room Price Snapshot", validatedData.room_price_snapshot);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const validatingInfo = await BookingRepository.getValidatingInformation();

        validatedData.booking_code = generateBookingCode(8);
        
        while (validatingInfo.some(booking => booking.booking_code === validatedData.booking_code)) {
            validatedData.booking_code = generateBookingCode(8);
        }
        
        validatedData.checkin_at = new Date(validatedData.checkin_at);
        validatedData.checkout_at = new Date(validatedData.checkout_at);
        
        let timeDiff = 0;

        if (validatedData.booking_type === "hourly") {
            timeDiff = generateHourDiff(validatedData.checkin_at, validatedData.checkout_at);
        } else {
            timeDiff = generateDayDiff(validatedData.checkin_at, validatedData.checkout_at);
        }

        validatedData.subtotal = validatedData.room_price_snapshot * timeDiff;

        if(validatedData.discount_id) {
            validator.isUUID("Discount ID", validatedData.discount_id);
            const discount = await DiscountRepository.getDiscountById(validatedData.discount_id);
            if (!discount) {
                validator.pushError("Discount not found");
            } else {
                validatedData.discount_amount = generateDiscountAmount(validatedData.subtotal, discount.discount_type, Number(discount.discount_value));
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        validatedData.status = "pending";
        validatedData.expires_at = new Date(Date.now() + 15 * 60 * 1000);
        validatedData.total_amount = validatedData.subtotal - validatedData.discount_amount;

        return await BookingRepository.createBooking(validatedData);
    };

    async updateBooking(id, data) {
        const validator = new Validator();
        const existingBooking = await BookingRepository.getBookingById(id);
        if (!existingBooking) {
            throw new ValidationError('404', "Booking not found");
        }

        const validatedData = {
            ...(data.booking_code && { booking_code: data.booking_code.trim() }),
            ...(data.assigned_room_id && { assigned_room_id: data.assigned_room_id.trim() }),
            ...(data.status && { status: data.status.trim() }),
            ...(data.actual_checkin_at && { actual_checkin_at: data.actual_checkin_at }),
            ...(data.actual_checkout_at && { actual_checkout_at: data.actual_checkout_at }),
            ...(data.num_guests && { num_guests: data.num_guests }),
            ...(data.discount_id && { discount_id: data.discount_id.trim() }),
            ...(data.discount_amount && { discount_amount: data.discount_amount }),
            ...(data.total_amount && { total_amount: data.total_amount }),
            ...(data.deposit_amount && { deposit_amount: data.deposit_amount }),
            ...(data.notes && { notes: data.notes.trim() }),
        };

        if(validatedData.booking_code) {
            validator.isString("Booking Code", validatedData.booking_code);
            validator.maxLength("Booking Code", validatedData.booking_code, 30);
            const codeExists = await BookingRepository.getBookingByCode(validatedData.booking_code);
            if (codeExists && codeExists.id !== id) {
                validator.pushError("Booking code already exists");
            }
        }
        if(validatedData.assigned_room_id) {
            validator.isUUID("Assigned Room ID", validatedData.assigned_room_id);
        }
        if(validatedData.status) {
            validator.validateBookingStatus(validatedData.status);
        }
        if(validatedData.num_guests) {
            validator.isPositiveNumber("Number of Guests", validatedData.num_guests);
        }
        if(validatedData.actual_checkin_at) {
            validator.validateDate(validatedData.actual_checkin_at);
        }
        if(validatedData.actual_checkout_at) {
            validator.validateDate(validatedData.actual_checkout_at);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await BookingRepository.updateBooking(id, validatedData);
    };

    async deleteBooking(id) {
        return await BookingRepository.deleteBooking(id);
    };
}

export default new BookingService();
