import InvoiceRepository from '../repositories/invoiceRepo';
import BookingRepository from '../repositories/bookingRepo';
import BookingServiceRepository from '../repositories/bookingServiceRepo';
import AccountRepository from '../repositories/accountRepo'
import { Validator, ValidationError } from '../middlewares/validateData';
import { calculateDynamicPrice, generateInvoiceCode } from '../middlewares/generator';
import historyTransactionServices from './historyTransactionServices';
import bookingRepo from '../repositories/bookingRepo';
import bookingServiceRepo from '../repositories/bookingServiceRepo';
import discountRepo from '../repositories/discountRepo';
import roomPriceRepo from '../repositories/roomPriceRepo';
import holidayDateRepo from '../repositories/holidayDateRepo';

class InvoiceService {
    async getAllInvoices() {
        return await InvoiceRepository.getAllInvoices();
    };

    async getInvoiceById(id) {
        const validator = new Validator();
        if (!validator.isEmpty("Invoice ID", id)) {
            validator.isUUID("Invoice ID", id);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await InvoiceRepository.getInvoiceById(id);
    };

    async getInvoiceByBookingId(id) {
        const validator = new Validator();
        if (!validator.isEmpty("Invoice ID", id)) {
            validator.isUUID("Invoice ID", id);
        }
        if (validator.error.length > 0)
            throw new ValidationError('400', validator.clearError());
        return await InvoiceRepository.getInvoicesByBookingId(id);
    }

    async calculateInvoiceAmount(bookingId) {
        const booking = await bookingRepo.getBookingById(bookingId);
        if (!booking)
            throw new ValidationError('404', "Booking not found");

        const services = await bookingServiceRepo.getBookingServicesByBookingId(bookingId);

        let discount = 0;
        if (booking.discount_id !== null) {
            if (booking.discount_amount !== null)
                discount = Number(booking.discount_amount);
        }

        let deposit = 0;
        if (booking.deposit_amount !== null)
            deposit = Number(booking.deposit_amount);

        let serviceCharge = 0;
        for (const service of services) {
            serviceCharge += Number(service.total_amount);
        }

        const roomPrice = await roomPriceRepo.getRoomPricesByRoomTypeId(booking.room_type_id);

        let basePrice = 0;
        if (booking.booking_type === 'daily')
            basePrice = Number(roomPrice?.price_per_day);
        else basePrice = Number(roomPrice?.price_per_hour)

        const holidayDates = await holidayDateRepo.getHolidayDatesByBranchId(booking.branch_id);

        let roomCharge = 0;
        if (booking.actual_checkin_at === null || booking.actual_checkout_at === null)
            roomCharge = calculateDynamicPrice(booking.checkin_at, booking.checkout_at, basePrice, roomPrice?.weekend_rate, roomPrice?.holiday_rate, holidayDates, booking.booking_type);
        else if (booking.actual_checkin_at !== null && booking.actual_checkout_at !== null)
            roomCharge = calculateDynamicPrice(booking.actual_checkin_at, booking.actual_checkout_at, basePrice, roomPrice?.weekend_rate, roomPrice?.holiday_rate, holidayDates, booking.booking_type);

        return {
            roomCharge,
            serviceCharge,
            discount,
            deposit,
            totalAmount: roomCharge + serviceCharge - discount - deposit,
        }
    }

    async createInvoice(data) {
        const validatedData = {
            ...(data.booking_id && { booking_id: data.booking_id }),
            ...(data.issued_by && { issued_by: data.issued_by }),
            ...(data.notes && { notes: data.notes }),
        };

        const validator = new Validator();

        if (!validator.isEmpty("Booking ID", validatedData.booking_id))
            validator.isUUID("Booking ID", validatedData.booking_id);
        if (!validator.isEmpty("Issued By", validatedData.issued_by))
            if (validator.isUUID("Issued By", validatedData.issued_by)) {
                const staffAccount = await AccountRepository.getAccountById(validatedData.issued_by);
                if (!staffAccount) {
                    throw new ValidationError('404', "Account not found");
                }
            }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const booking = await BookingRepository.getBookingById(validatedData.booking_id);
        if (!booking) {
            throw new ValidationError('404', "Booking not found");
        }

        const bookingServices = await BookingServiceRepository.getBookingServicesByBookingId(validatedData.booking_id);

        if (bookingServices.length > 0) {
            const serviceCharge = bookingServices.reduce((total, item) => total + Number(item.total_amount || 0), 0);
            validatedData.service_charge = serviceCharge;
        } else
            validatedData.service_charge = 0;

        validatedData.room_charge = Number(booking.total_amount);
        validatedData.discount_amount = Number(booking.discount_amount || 0);
        validatedData.total_amount = Number(booking.total_amount) + validatedData.service_charge - validatedData.discount_amount;
        validatedData.deposit_used = Number(booking.deposit_amount);
        validatedData.amount_due = validatedData.total_amount - validatedData.deposit_used;
        if (validatedData.amount_due < 0) {
            validatedData.refund_amount = Math.abs(validatedData.amount_due);
            validatedData.amount_due = 0;
        }

        const codesExists = await InvoiceRepository.getAllCode();

        validatedData.invoice_code = generateInvoiceCode();

        while (codesExists.includes(validatedData.invoice_code)) {
            validatedData.invoice_code = generateInvoiceCode();
        }

        try {
            const result = await InvoiceRepository.createInvoice(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id,
                    "Invoice",
                    result.id,
                    result
                );
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async updateInvoice(id, data) {
        const validator = new Validator();
        const existingInvoice = await InvoiceRepository.getInvoiceById(id);
        if (!existingInvoice) {
            throw new ValidationError('404', "Invoice not found");
        }

        const validatedData = {
            ...(data.room_charge && { room_charge: data.room_charge }),
            ...(data.service_charge && { service_charge: data.service_charge }),
            ...(data.fine_charge && { fine_charge: data.fine_charge }),
            ...(data.late_checkout_fee && { late_checkout_fee: data.late_checkout_fee }),
            ...(data.early_checkout_fee && { early_checkout_fee: data.early_checkout_fee }),
            ...(data.discount_amount && { discount_amount: data.discount_amount }),
            ...(data.total_amount && { total_amount: data.total_amount }),
            ...(data.deposit_used && { deposit_used: data.deposit_used }),
            ...(data.amount_due && { amount_due: data.amount_due }),
            ...(data.refund_amount && { refund_amount: data.refund_amount }),
            ...(data.notes && { notes: data.notes }),
        };

        if (validatedData.room_charge) {
            validator.isDecimal("Room Charge", validatedData.room_charge);
        }
        if (validatedData.service_charge) {
            validator.isDecimal("Service Charge", validatedData.service_charge);
        }
        if (validatedData.fine_charge) {
            validator.isDecimal("Fine Charge", validatedData.fine_charge);
        }
        if (validatedData.total_amount) {
            validator.isDecimal("Total Amount", validatedData.total_amount);
            validator.isNonNegativeNumber("Total Amount", validatedData.total_amount);
        }
        if (validatedData.amount_due) {
            validator.isDecimal("Amount Due", validatedData.amount_due);
            validator.isNonNegativeNumber("Amount Due", validatedData.amount_due);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        try {
            const before = await InvoiceRepository.getInvoiceById(id);
            const after = await InvoiceRepository.updateInvoice(id, validatedData);
            if (after)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id,
                    "Invoice",
                    id,
                    before,
                    after,
                    Object.keys(validatedData)
                );
            return after;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async deleteInvoice(id) {
        return await InvoiceRepository.deleteInvoice(id);
    };
}

export default new InvoiceService();
