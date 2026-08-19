import BookingRepository from '../repositories/bookingRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import { calculateDynamicPrice, generateBookingCode, generateDiscountAmount } from '../middlewares/generator';
import accountServices from './accountServices';
import historyTransactionServices from './historyTransactionServices';
import roomPriceServices from './roomPriceServices';
import roomServices from './roomServices';
import { room_status } from '../generated/prisma/enums';
import discountServices from './discountServices';
import branchServices from './branchServices';
import customerServices from './customerServices';
import roomTypeServices from './roomTypeServices';
import holidayDateServices from './holidayDateServices';
import bookingServiceServices from './bookingServiceServices';

class BookingService {
    async getAllBookings() {
        return await BookingRepository.getAllBookings();
    };

    async getBookingById(id) {
        const validator = new Validator();
        if (!validator.isUUID("ID", id))
            throw new ValidationError("400", validator.clearError());
        try {
            const booking = await BookingRepository.getBookingById(id);
            if (booking) {
                const room_charge = Number(booking.subtotal);
                const deposited = booking.payments.reduce((acc, payment) => {
                    if (payment.is_deposit) {
                        return acc + Number(payment.amount);
                    }
                    return acc;
                }, 0);
                const service_charge = booking.booking_services.reduce((acc, service) => {
                    return acc + Number(service.total_amount);
                }, 0)
                const discount = Number(booking.discount_amount);
                Object.assign(booking, {
                    charge: {
                        room_charge,
                        service_charge,
                        total: room_charge + service_charge - discount,
                        discount,
                        deposited,
                        balance: room_charge + service_charge - discount - deposited,
                    }
                });
            }
            return booking;
        } catch (error) {

        }
    };

    async getBookingByCode(code) {
        const validator = new Validator();
        if (validator.isEmpty("Booking Code", code))
            throw new ValidationError('400', validator.clearError());
        return await BookingRepository.getBookingByCode(code);
    };

    async getBookingByBranchId(id, status?) {
        const validator = new Validator();
        if (!validator.isUUID("Branch ID", id))
            throw new ValidationError('400', validator.clearError());
        return await BookingRepository.getBookingsByBranchId(id, status);
    }

    async getBookingByCustomerId(id) {
        const validator = new Validator();
        if (!validator.isUUID("Customer ID", id))
            throw new ValidationError('400', validator.clearError());
        try {
            const result = await BookingRepository.getBookingsByCustomerId(id);
            result.map((booking) => {
                const room_charge = Number(booking.subtotal);
                const deposited = booking.payments.reduce((acc, payment) => {
                    if (payment.is_deposit && payment.status === 'paid') {
                        return acc + Number(payment.amount);
                    }
                    return acc;
                }, 0);
                const service_charge = booking.booking_services.reduce((acc, service) => {
                    return acc + Number(service.total_amount);
                }, 0)
                const discount = Number(booking.discount_amount);
                Object.assign(booking, {
                    charge: {
                        room_charge,
                        service_charge,
                        total: room_charge + service_charge - discount,
                        discount,
                        deposited,
                        balance: room_charge + service_charge - discount - deposited,
                    }
                });
            });
            return result;
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

    async calculateBookingPrice(room_type_id, checkin_at, checkout_at, booking_type, branch_id) {
        const validator = new Validator();
        validator.isUUID("Room Type ID", room_type_id);
        validator.isUUID("Branch ID", branch_id);
        validator.validateDateOrder(checkin_at, checkout_at);
        if (validator.error.length > 0)
            throw new ValidationError('400', validator.clearError());
        const roomPrice = await roomPriceServices.getRoomPricesByRoomTypeId(room_type_id);
        if (!roomPrice) {
            throw new ValidationError('404', 'Room price not found');
        }

        const holidays = await holidayDateServices.getHolidayDatesByBranchId(branch_id);
        const holidayDates = holidays.map((h: any) => new Date(h.date).toDateString());

        let price;
        if (booking_type === 'daily')
            price = roomPrice.price_per_day;
        else price = roomPrice.price_per_hour;

        const result = calculateDynamicPrice(new Date(checkin_at), new Date(checkout_at), price, roomPrice.weekend_rate, roomPrice.holiday_rate, holidayDates, booking_type);

        return result;
    }

    async getTodayCheckinCount(branch_id) {
        const validator = new Validator();
        if (!validator.isEmpty("Branch ID", branch_id))
            validator.isUUID("Branch ID", branch_id);
        if (validator.error.length > 0)
            throw new ValidationError('400', validator.clearError());
        return await BookingRepository.getTodayCheckinCount(branch_id);
    }

    async createBooking(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.customer_id && { customer_id: data.customer_id }),
            ...(data.assigned_room_id && { assigned_room_id: data.assigned_room_id }),
            ...(data.room_type_id && { room_type_id: data.room_type_id }),
            ...(data.booking_type && { booking_type: data.booking_type }),
            ...(data.deposit_amount && { deposit_amount: data.deposit_amount }),
            ...(data.status && { status: data.status }),
            ...(data.checkin_at && { checkin_at: data.checkin_at }),
            ...(data.checkout_at && { checkout_at: data.checkout_at }),
            ...(data.num_guests && { num_guests: data.num_guests }),
            ...(data.discount_id && { discount_id: data.discount_id }),
            ...(data.created_by && { created_by: data.created_by }),
            ...(data.notes && { notes: data.notes }),
        };

        const validator = new Validator();

        const branch = await branchServices.getBranchById(validatedData.branch_id);
        if (!branch) {
            throw new ValidationError('404', 'Branch not found');
        }

        const customer = await customerServices.getCustomerById(validatedData.customer_id);
        if (!customer) {
            throw new ValidationError('404', 'Customer not found');
        }

        const roomType = await roomTypeServices.getRoomTypeById(validatedData.room_type_id);
        if (!roomType) {
            throw new ValidationError('404', 'Room type not found');
        }

        const roomPrice = await roomPriceServices.getRoomPricesByRoomTypeId(validatedData.room_type_id);
        if (!roomPrice) {
            throw new ValidationError('404', 'No room price found for the specified room type');
        }

        if (validatedData.created_by) {
            const staff = await accountServices.getAccountById(validatedData.created_by);
            if (!staff)
                throw new ValidationError('404', "Staff's account not found");
        }

        if (!validator.isEmpty("Booking Type", validatedData.booking_type))
            validator.validateBookingType(validatedData.booking_type);
        if (!validator.isEmpty("Checkin At", validatedData.checkin_at))
            validator.validateDate(validatedData.checkin_at);
        if (!validator.isEmpty("Checkout At", validatedData.checkout_at))
            validator.validateDate(validatedData.checkout_at);

        if (validator.validateDateOrder(validatedData.checkin_at, validatedData.checkout_at)) {
            let checkin = new Date(validatedData.checkin_at);
            let checkout = new Date(validatedData.checkout_at);
            let current = new Date();
            if (validatedData.booking_type == 'daily') {
                checkin.setHours(0, 0, 0, 0);
                current.setHours(0, 0, 0, 0);
                if (checkin.getTime() < current.getTime())
                    validatedData.pushError("Check-in date must be in the future");
                else {
                    checkin.setHours(13, 0, 0, 0);
                    checkout.setHours(12, 0, 0, 0);
                    validatedData.checkin_at = checkin;
                    validatedData.checkout_at = checkout;
                }
            } else if (validatedData.booking_type == 'hourly') {
                if (checkin.getTime() < current.getTime())
                    validatedData.pushError("Check-in time must be in the future");
                else {
                    validatedData.checkin_at = checkin;
                    validatedData.checkout_at = checkout;
                }
            }
        }

        if (validatedData.num_guests) {
            validator.isPositiveNumber("Number of Guests", validatedData.num_guests);
        }

        const validatingInfo = await BookingRepository.getValidatingInformation();
        validatedData.booking_code = generateBookingCode(8);
        while (validatingInfo.some(booking => booking.booking_code === validatedData.booking_code)) {
            validatedData.booking_code = generateBookingCode(8);
        }

        if (validatedData.booking_type === "daily")
            validatedData.room_price_snapshot = roomPrice.price_per_day;
        else
            validatedData.room_price_snapshot = roomPrice.price_per_hour;

        const holidays = await holidayDateServices.getHolidayDatesByBranchId(validatedData.branch_id);
        const holidayDates = holidays.map((h: any) => new Date(h.date).toDateString());

        validatedData.subtotal = calculateDynamicPrice(
            validatedData.checkin_at,
            validatedData.checkout_at,
            Number(validatedData.room_price_snapshot),
            Number(roomPrice.weekend_rate),
            Number(roomPrice.holiday_rate),
            holidayDates,
            validatedData.booking_type
        );

        validatedData.total_amount = validatedData.subtotal;

        if (validatedData.discount_id) {
            const discount = await discountServices.getDiscountById(validatedData.discount_id);
            if (!discount) {
                throw new ValidationError("404", "Discount not found");
            } else {
                validatedData.discount_amount = generateDiscountAmount(validatedData.subtotal, discount.discount_type, Number(discount.discount_value));
                validatedData.total_amount -= validatedData.discount_amount;
                await discountServices.updateDiscount(discount.id, { used_count: discount.used_count ? discount.used_count + 1 : 1 });
            }
        }

        if (!validatedData.deposit_amount)
            validatedData.deposit_amount = Math.ceil((validatedData.total_amount * 0.3) / 1000) * 1000;

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (!validatedData.status)
            validatedData.status = "pending";
        validatedData.expires_at = new Date(Date.now() + 15 * 60 * 1000);

        try {
            const result = await BookingRepository.createBookingWithOverlapChecking(validatedData);
            if (result) {
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id,
                    "Đơn đặt phòng",
                    result.id,
                    result.created_at,
                )
            }
            return await this.getBookingById(result.id);
        } catch (error: any) {
            if (error.message.includes("Overbooking"))
                throw new ValidationError('409', error.message);
            else
                throw new Error(error);
        }
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
            ...(data.expires_at !== undefined && { expires_at: data.expires_at }),
            ...(data.notes && { notes: data.notes }),
        };

        const validator = new Validator();

        const existingBooking = await this.getBookingById(id);
        if (!existingBooking) {
            throw new ValidationError('404', 'Booking not found');
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
                let checkin = new Date(validatedData.checked_in);
                let checkout = new Date(validatedData.checkout_at);
                let current = new Date();
                if (validatedData.booking_type == 'daily' || existingBooking.booking_type == 'daily') {
                    checkin.setHours(0, 0, 0, 0);
                    current.setHours(0, 0, 0, 0);
                    if (checkin.getTime() < current.getTime())
                        validator.pushError("Check-in date must be in the future");

                    checkin.setHours(13, 0, 0, 0);
                    checkout.setHours(12, 0, 0, 0);
                    validatedData.checkin_at = checkin;
                    validatedData.checkout_at = checkout;
                } else {
                    if (checkin.getTime() < current.getTime())
                        validator.pushError("Check-in time must be in the future");
                    validatedData.checkin_at = checkin;
                    validatedData.checkout_at = checkout;
                }
            }
        } else if (validatedData.checkin_at) {
            if (validator.validateDate(validatedData.checkin_at)) {
                let current = new Date();
                let checkin = new Date(validatedData.checkin_at);
                let checkout = new Date(existingBooking.checkout_at);
                if (validatedData.booking_type == 'daily' || existingBooking.booking_type == 'daily') {
                    current.setHours(0, 0, 0, 0);
                    checkin.setHours(0, 0, 0, 0);
                    checkout.setHours(0, 0, 0, 0);
                    if (current.getTime() > checkin.getTime())
                        validator.pushError("Check-in date must be in the future");
                    else if (checkout.getTime() <= checkin.getTime())
                        validator.pushError("Check-in date must be before the check-out date")
                    checkin.setHours(13, 0, 0, 0);
                } else {
                    if (current.getTime() > checkin.getTime())
                        validator.pushError("Check-in time must be in the future");
                    else if (checkout.getTime() <= checkin.getTime())
                        validator.pushError("Check-in time must be before the check-out time")
                }
                validatedData.checkin_at = checkin;
            }
        } else if (validatedData.checkout_at) {
            if (validator.validateDate(validatedData.checkout_at)) {
                let current = new Date();
                let checkin = new Date(existingBooking.checkin_at);
                let checkout = new Date(validatedData.checkout_at);
                if (validatedData.booking_type == 'daily' || existingBooking.booking_type == 'daily') {
                    current.setHours(0, 0, 0, 0);
                    checkin.setHours(0, 0, 0, 0);
                    checkout.setHours(0, 0, 0, 0);
                    if (current.getTime() > checkout.getTime())
                        validator.pushError("Check-out date must be in the future");
                    else if (checkout.getTime() <= checkin.getTime())
                        validator.pushError("Check-out date must be after the existing booking's check-in date");
                } else {
                    if (current.getTime() > checkout.getTime())
                        validator.pushError("Check-out time must be in the future");
                    else if (checkout.getTime() <= checkin.getTime())
                        validator.pushError("Check-out time must be after the existing booking's check-in time");
                }
                validatedData.checkout_at = checkout;
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

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.assigned_room_id && validatedData.status === 'checked_in') {
            const room = await roomServices.getRoomById(validatedData.assigned_room_id);
            if (room?.status === room_status.available)
                await roomServices.updateRoom(validatedData.assigned_room_id, { status: "occupied" });
            else throw new ValidationError('409', 'Room is not ready');
        }

        if (validatedData.assigned_room_id && validatedData.status === 'checked_out') {
            await roomServices.updateRoom(validatedData.assigned_room_id, { status: 'available' });
        }

        const roomTypeId = validatedData.room_type_id ?? existingBooking.room_type_id;
        const branchId = validatedData.branch_id ?? existingBooking.branch_id;

        let roomPrice;
        let holidayDates;

        if (roomTypeId) {
            roomPrice = await roomPriceServices.getRoomPricesByRoomTypeId(roomTypeId);
        }

        if (branchId) {
            const holidays = await holidayDateServices.getHolidayDatesByBranchId(branchId);
            holidayDates = holidays.map((h: any) => new Date(h.date).toDateString());
        }

        if (validatedData.actual_checkin_at && validatedData.actual_checkout_at) {
            let room_price_snapshot = validatedData.room_price_snapshot ?? existingBooking.room_price_snapshot;
            if (roomPrice && room_price_snapshot) {
                validatedData.subtotal = calculateDynamicPrice(
                    validatedData.actual_checkin_at,
                    validatedData.actual_checkout_at,
                    Number(room_price_snapshot),
                    Number(roomPrice?.weekend_rate),
                    Number(roomPrice?.holiday_rate),
                    holidayDates,
                    existingBooking.booking_type
                );
            } else {
                validatedData.subtotal = Number(existingBooking.subtotal);
            }
        } else if (validatedData.checkin_at && validatedData.checkout_at) {
            let room_price_snapshot = validatedData.room_price_snapshot ?? existingBooking.room_price_snapshot;
            if (roomPrice && room_price_snapshot) {
                validatedData.subtotal = calculateDynamicPrice(
                    validatedData.checkin_at,
                    validatedData.checkout_at,
                    Number(room_price_snapshot),
                    Number(roomPrice?.weekend_rate),
                    Number(roomPrice?.holiday_rate),
                    holidayDates,
                    existingBooking.booking_type
                );
            } else {
                validatedData.subtotal = Number(existingBooking.subtotal);
            }
        } else if (validatedData.room_price_snapshot) {
            if (roomPrice) {
                validatedData.subtotal = calculateDynamicPrice(
                    validatedData.checkin_at ?? existingBooking.checkin_at,
                    validatedData.checkout_at ?? existingBooking.checkout_at,
                    Number(validatedData.room_price_snapshot),
                    Number(roomPrice?.weekend_rate),
                    Number(roomPrice?.holiday_rate),
                    holidayDates,
                    existingBooking.booking_type
                );
            } else {
                validatedData.subtotal = Number(existingBooking.subtotal);
            }
        } else {
            validatedData.subtotal = Number(existingBooking.subtotal);
        }

        validatedData.total_amount = validatedData.subtotal;

        const discount_id = validatedData.discount_id || existingBooking.discount_id;

        if (discount_id) {
            const isDiscountChanged = validatedData.discount_id && validatedData.discount_id !== existingBooking.discount_id;

            if (isDiscountChanged) {
                if (validator.isUUID("Discount ID", discount_id)) {
                    const discount = await discountServices.getDiscountById(discount_id);
                    if (!discount || discount.is_active === false) {
                        validator.pushError("Discount is not available");
                    } else {
                        if (discount.valid_to && discount.valid_to.getTime() < new Date().getTime()) {
                            validator.pushError("Discount is expired");
                        }
                        if (discount.valid_from && discount.valid_from.getTime() > new Date().getTime()) {
                            validator.pushError("Discount is not available yet");
                        }
                        if (discount.usage_limit && (discount.used_count && discount.used_count >= discount.usage_limit)) {
                            validator.pushError("Discount is expired");
                        }

                        const services = await bookingServiceServices.getBookingServicesByBookingId(existingBooking.id);
                        const service_charge = services.reduce((acc, curr) => {
                            return acc + Number(curr.total_amount);
                        }, 0);

                        if (validatedData.subtotal + service_charge >= Number(discount.min_order_value)) {
                            validatedData.discount_amount = generateDiscountAmount(Number(validatedData.subtotal), discount.discount_type, Number(discount.discount_value));
                            validatedData.total_amount -= validatedData.discount_amount;
                            if (existingBooking.discount_id) {
                                const old_discount = await discountServices.getDiscountById(existingBooking.discount_id);
                                await discountServices.updateDiscount(old_discount?.id, { used_count: old_discount?.used_count ? old_discount.used_count - 1 : 0 });
                            }
                            await discountServices.updateDiscount(discount.id, { used_count: discount.used_count ? discount.used_count + 1 : 1 });
                        } else {
                            validatedData.discount_id = null;
                            validatedData.discount_amount = 0;
                        }
                    }
                }
            } else if (existingBooking.discount_id) {
                const discount = await discountServices.getDiscountById(existingBooking.discount_id);
                const services = await bookingServiceServices.getBookingServicesByBookingId(existingBooking.id);
                const service_charge = services.reduce((acc, curr) => {
                    return acc + Number(curr.total_amount);
                }, 0);
                if (validatedData.subtotal + service_charge >= Number(discount?.min_order_value)) {
                    validatedData.discount_amount = Number(existingBooking.discount_amount);
                    validatedData.total_amount -= validatedData.discount_amount;
                } else {
                    validatedData.discount_id = null;
                    validatedData.discount_amount = 0;
                    await discountServices.updateDiscount(discount?.id, { used_count: discount?.used_count ? discount.used_count - 1 : 0 });
                }
            } else {
                validatedData.discount_id = null;
                validatedData.discount_amount = 0;
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.status === 'completed') {
            if (existingBooking.assigned_room_id)
                await roomServices.updateRoom(existingBooking.assigned_room_id, { status: 'available' });
        }

        validatedData.updated_at = new Date();
        try {
            const before = await BookingRepository.getBookingById(id);
            const after = await BookingRepository.updateBooking(id, validatedData);
            if (after) {
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id,
                    "Đơn đặt phòng",
                    id,
                    before,
                    after,
                    Object.keys(validatedData)
                )
            }
            return after;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async deleteBooking(id) {
        return await BookingRepository.deleteBooking(id);
    };
}

export default new BookingService();
