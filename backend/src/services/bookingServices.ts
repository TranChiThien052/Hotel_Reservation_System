import BookingRepository from '../repositories/bookingRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import { generateBookingCode, generateDayDiff, generateDiscountAmount, generateHourDiff, generateSubtotal } from '../middlewares/generator';
import DiscountRepository from '../repositories/discountRepo';
import RoomPriceRepository from '../repositories/roomPriceRepo';
import BranchRepository from '../repositories/branchRepo';
import CustomerRepository from '../repositories/customerRepo';
import RoomTypeRepository from '../repositories/roomTypeRepo';

class BookingService {
    async getAllBookings() {
        return await BookingRepository.getAllBookings();
    };

    async getBookingById(id) {
        return await BookingRepository.getBookingById(id);
    };

    async createBooking(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.customer_id && { customer_id: data.customer_id }),
            ...(data.room_type_id && { room_type_id: data.room_type_id }),
            ...(data.assigned_room_id && { assigned_room_id: data.assigned_room_id }),
            ...(data.booking_type && { booking_type: data.booking_type }),
            ...(data.checkin_at && { checkin_at: data.checkin_at }),
            ...(data.checkout_at && { checkout_at: data.checkout_at }),
            ...(data.num_guests && { num_guests: data.num_guests }),
            ...(data.discount_id && { discount_id: data.discount_id }),
            ...(data.created_by && { created_by: data.created_by }),
            ...(data.notes && { notes: data.notes }),
        };

        const validator = new Validator();
        if (!validator.isEmpty("Branch ID", validatedData.branch_id)) {
            if (validator.isUUID("Branch ID", validatedData.branch_id)) {
                const branch = await BranchRepository.getBranchById(validatedData.branch_id);
                if (!branch) {
                    throw new ValidationError('400', 'Branch not found');
                }
            }
        }
        if (!validator.isEmpty("Customer ID", validatedData.customer_id)) {
            if (validator.isUUID("Customer ID", validatedData.customer_id)) {
                const customer = await CustomerRepository.getCustomerById(validatedData.customer_id);
                if (!customer) {
                    throw new ValidationError('400', 'Customer not found');
                }
            }
        }
        if (!validator.isEmpty("Room Type ID", validatedData.room_type_id)) {
            if (validator.isUUID("Room Type ID", validatedData.room_type_id)) {
                const roomPrice = await RoomTypeRepository.getRoomTypeById(validatedData.room_type_id);
                if (!roomPrice) {
                    throw new ValidationError('400', 'Room type not found');
                }
            }
        }
        if (!validator.isEmpty("Booking Type", validatedData.booking_type))
            validator.validateBookingType(validatedData.booking_type);
        if (!validator.isEmpty("Checkin At", validatedData.checkin_at))
            validator.validateDate(validatedData.checkin_at);
        if (!validator.isEmpty("Checkout At", validatedData.checkout_at))
            validator.validateDate(validatedData.checkout_at);
        if (validatedData.created_by) {
            validator.isUUID("Created By", validatedData.created_by);
        }

        if (validator.validateDateOrder(validatedData.checkin_at, validatedData.checkout_at))
            if (new Date(validatedData.checkin_at) < new Date())
                validator.pushError("Check-in date must be in the future");
            else {
                validatedData.checkin_at = new Date(validatedData.checkin_at);
                validatedData.checkout_at = new Date(validatedData.checkout_at);
            }

        if (validatedData.num_guests) {
            validator.isPositiveNumber("Number of Guests", validatedData.num_guests);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const validatingInfo = await BookingRepository.getValidatingInformation();

        validatedData.booking_code = generateBookingCode(8);

        while (validatingInfo.some(booking => booking.booking_code === validatedData.booking_code)) {
            validatedData.booking_code = generateBookingCode(8);
        }

        const roomPrice = await RoomPriceRepository.getRoomPricesByRoomTypeId(validatedData.room_type_id);
        if (!roomPrice) {
            throw new ValidationError('400', 'No room price found for the specified room type');
        }

        if (validatedData.booking_type === "daily")
            validatedData.room_price_snapshot = roomPrice.price_per_day;
        else
            validatedData.room_price_snapshot = roomPrice.price_per_hour;

        validatedData.subtotal = generateSubtotal(validatedData.room_price_snapshot, validatedData.checkin_at, validatedData.checkout_at, validatedData.booking_type);
        validatedData.total_amount = validatedData.subtotal;

        if (validatedData.discount_id) {
            validator.isUUID("Discount ID", validatedData.discount_id);
            const discount = await DiscountRepository.getDiscountById(validatedData.discount_id);
            if (!discount) {
                validator.pushError("Discount not found");
            } else {
                validatedData.discount_amount = generateDiscountAmount(validatedData.subtotal, discount.discount_type, Number(discount.discount_value));
                validatedData.total_amount -= validatedData.discount_amount;
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (!validatedData.status)
            validatedData.status = "pending";
        validatedData.expires_at = new Date(Date.now() + 15 * 60 * 1000);

        return await BookingRepository.createBooking(validatedData);
    };

    async updateBooking(id, data) {
        const validatedData = {
            ...(data.room_type_id && { room_type_id: data.room_type_id }),
            ...(data.assigned_room_id && { assigned_room_id: data.assigned_room_id }),
            ...(data.booking_type && { booking_type: data.booking_type }),
            ...(data.status && { status: data.status }),
            ...(data.checkin_at && { checkin_at: data.checkin_at }),
            ...(data.checkout_at && { checkout_at: data.checkout_at }),
            ...(data.actual_checkin_at && { actual_checkin_at: data.actual_checkin_at }),
            ...(data.actual_checkout_at && { actual_checkout_at: data.actual_checkout_at }),
            ...(data.num_guests && { num_guests: data.num_guests }),
            ...(data.discount_id && { discount_id: data.discount_id }),
            ...(data.deposit_amount && { deposit_amount: data.deposit_amount }),
            ...(data.deposit_paid_at && { deposit_paid_at: data.deposit_paid_at }),
            ...(data.expires_at && { expires_at: data.expires_at }),
            ...(data.notes && { notes: data.notes }),
        };

        const validator = new Validator();

        const existingBooking = await BookingRepository.getBookingById(id);
        if (!existingBooking) {
            throw new ValidationError('404', 'Booking not found');
        }

        if (validatedData.assigned_room_id) {
            validator.isUUID("Assigned Room ID", validatedData.assigned_room_id);
        }

        if (validatedData.booking_type) {
            validator.validateBookingType(validatedData.booking_type);
        }

        if (validatedData.status) {
            validator.validateBookingStatus(validatedData.status);
        }

        if (validatedData.num_guests) {
            validator.isPositiveNumber("Number of Guests", validatedData.num_guests);
        }

        if (validatedData.checkin_at && validatedData.checkout_at) {
            if (validator.validateDateOrder(validatedData.checkin_at, validatedData.checkout_at)) {
                if (new Date(validatedData.checkin_at) < new Date()) {
                    validator.pushError("Check-in date must be in the future");
                }
                validatedData.checkin_at = new Date(validatedData.checkin_at);
                validatedData.checkout_at = new Date(validatedData.checkout_at);
            }
        } else if (validatedData.checkin_at) {
            if (validator.validateDate(validatedData.checkin_at)) {
                if (new Date(validatedData.checkin_at) < new Date()) {
                    validator.pushError("Check-in date must be in the future");
                } else if (new Date(validatedData.checkin_at) >= new Date(existingBooking.checkout_at)) {
                    validator.pushError("Check-in date must be before the existing booking's check-out date");
                }
                validatedData.checkin_at = new Date(validatedData.checkin_at);
            }
        } else if (validatedData.checkout_at) {
            if (validator.validateDate(validatedData.checkout_at)) {
                if (new Date(validatedData.checkout_at) < new Date()) {
                    validator.pushError("Check-out date must be in the future");
                } else if (new Date(validatedData.checkout_at) <= new Date(existingBooking.checkin_at)) {
                    validator.pushError("Check-out date must be after the existing booking's check-in date");
                }
                validatedData.checkout_at = new Date(validatedData.checkout_at);
            }
        }

        if (validatedData.actual_checkin_at && validatedData.actual_checkout_at) {
            if (validator.validateDateOrder(validatedData.actual_checkin_at, validatedData.actual_checkout_at)) {
                validatedData.actual_checkin_at = new Date(validatedData.actual_checkin_at);
                validatedData.actual_checkout_at = new Date(validatedData.actual_checkout_at);
            }
        } else if (validatedData.actual_checkin_at) {
            if (validator.validateDate(validatedData.actual_checkin_at)) {
                validatedData.actual_checkin_at = new Date(validatedData.actual_checkin_at);
            }
        } else if (validatedData.actual_checkout_at) {
            if (validator.validateDate(validatedData.actual_checkout_at)) {
                validatedData.actual_checkout_at = new Date(validatedData.actual_checkout_at);
            }
        }

        if (validatedData.num_guests) {
            validator.isPositiveNumber("Number of Guests", validatedData.num_guests);
        }

        if (validatedData.room_price_snapshot) {
            validator.isDecimal("Room Price Snapshot", validatedData.room_price_snapshot);
            validator.isNonNegativeNumber("Room Price Snapshot", validatedData.room_price_snapshot);
        }

        if (validatedData.deposit_amount) {
            validator.isDecimal("Deposit Amount", validatedData.deposit_amount);
            validator.isNonNegativeNumber("Deposit Amount", validatedData.deposit_amount);
        }

        if (validatedData.deposit_paid_at) {
            if (validator.validateDate(validatedData.deposit_paid_at)) {
                validatedData.deposit_paid_at = new Date(validatedData.deposit_paid_at);
            }
        }

        if (validatedData.expires_at) {
            if (validator.validateDate(validatedData.expires_at)) {
                if (new Date(validatedData.expires_at) < new Date()) {
                    validator.pushError("Expiration date must be in the future");
                }
            } else {
                validatedData.expires_at = new Date(validatedData.expires_at);
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        validatedData.subtotal = generateSubtotal(
            validatedData.room_price_snapshot || existingBooking.room_price_snapshot,
            validatedData.checkin_at || existingBooking.checkin_at,
            validatedData.checkout_at || existingBooking.checkout_at,
            validatedData.booking_type || existingBooking.booking_type
        );

        validatedData.total_amount = validatedData.subtotal;

        if (validatedData.discount_id) {
            if (validator.isUUID("Discount ID", validatedData.discount_id)) {
                const discount = await DiscountRepository.getDiscountById(validatedData.discount_id);
                if (!discount) {
                    validator.pushError("Discount not found");
                } else {
                    validatedData.discount_amount = generateDiscountAmount(Number(validatedData.subtotal), discount.discount_type, Number(discount.discount_value));
                    validatedData.total_amount -= validatedData.discount_amount;
                }
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        validatedData.updated_at = new Date();

        return await BookingRepository.updateBooking(id, validatedData);
    };

    async deleteBooking(id) {
        return await BookingRepository.deleteBooking(id);
    };
}

export default new BookingService();
