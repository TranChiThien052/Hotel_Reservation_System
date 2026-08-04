import InvoiceRepository from '../repositories/invoiceRepo';
import AccountRepository from '../repositories/accountRepo'
import { Validator, ValidationError } from '../middlewares/validateData';
import { calculateDynamicPrice, generateInvoiceCode } from '../middlewares/generator';
import historyTransactionServices from './historyTransactionServices';
import paymentRepo from '../repositories/paymentRepo';
import { booking_type } from '../generated/prisma/enums';
import bookingServices from './bookingServices';
import bookingServiceServices from './bookingServiceServices';
import roomPriceServices from './roomPriceServices';
import holidayDateServices from './holidayDateServices';
import discountServices from './discountServices';

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

        const old_invoice = await InvoiceRepository.getInvoiceById(id);

        if (old_invoice) {
            const charges = await this.calculateInvoiceAmount(old_invoice.booking_id);
            const update_data = {
                room_charge: charges.room_charge,
                service_charge: charges.service_charge,
                discount_amount: charges.discount,
                deposit_used: charges.deposited,
                total_amount: charges.total,
                amount_due: charges.balance < 0 ? 0 : charges.balance,
                refund_amount: charges.balance < 0 ? Math.abs(charges.balance) : 0,
            }
            await InvoiceRepository.updateInvoice(old_invoice.id, update_data);
            return { ...old_invoice, ...update_data };
        }

        throw new ValidationError('404', "Invoice not found");
    };

    async getInvoiceByBookingId(id) {
        const validator = new Validator();
        if (!validator.isEmpty("Booking ID", id)) {
            validator.isUUID("Booking ID", id);
        }
        if (validator.error.length > 0)
            throw new ValidationError('400', validator.clearError());
        const old_invoices = await InvoiceRepository.getInvoicesByBookingId(id);
        const old_invoice = old_invoices[0];
        if (!old_invoice)
            return null;
        const charges = await this.calculateInvoiceAmount(id);
        const update_data = {
            room_charge: charges.room_charge.amount,
            service_charge: charges.service_charge,
            discount_amount: charges.discount,
            deposit_used: charges.deposited,
            total_amount: charges.total,
            amount_due: charges.balance < 0 ? 0 : charges.balance,
            refund_amount: charges.balance < 0 ? Math.abs(charges.balance) : 0,
        }
        try {
            await InvoiceRepository.updateInvoice(old_invoice.id, update_data);
        } catch (error) {
            throw new ValidationError('500', "Internal server error");
        }
        return {
            ...old_invoice,
            ...update_data,
        };
    }

    async calculateInvoiceAmount(bookingId) {
        const booking = await bookingServices.getBookingById(bookingId);
        if (!booking)
            throw new ValidationError('404', "Booking not found");

        const services = await bookingServiceServices.getBookingServicesByBookingId(bookingId);

        let service_charge = 0;
        for (const service of services) {
            service_charge += Number(service.total_amount);
        }

        const roomPrice = await roomPriceServices.getRoomPricesByRoomTypeId(booking.room_type_id);

        let basePrice = booking.room_price_snapshot;
        const holidayDates = await holidayDateServices.getHolidayDatesByBranchId(booking.branch_id);

        let detail: any = {};

        let room_charge = 0;
        if (booking.actual_checkin_at === null || booking.actual_checkout_at === null && booking.booking_type === booking_type.daily) {
            room_charge = calculateDynamicPrice(booking.checkin_at, booking.checkout_at, basePrice, roomPrice?.weekend_rate, roomPrice?.holiday_rate, holidayDates, booking.booking_type);
            detail.checkin_at = booking.checkin_at;
            detail.checkout_at = booking.checkout_at;
            detail.total_night = Number(booking.checkout_at.getTime() - booking.checkin_at.getTime()) / (1000 * 60 * 60 * 24);
        } else if (booking.actual_checkin_at !== null && booking.actual_checkout_at !== null && booking.booking_type === booking_type.daily) {
            room_charge = calculateDynamicPrice(booking.actual_checkin_at, booking.actual_checkout_at, basePrice, roomPrice?.weekend_rate, roomPrice?.holiday_rate, holidayDates, booking.booking_type);
            detail.checkin_at = booking.actual_checkin_at;
            detail.checkout_at = booking.actual_checkout_at;
            detail.total_night = Number(booking.actual_checkout_at.getTime() - booking.actual_checkin_at.getTime()) / (1000 * 60 * 60 * 24);
            detail.total_night === 0 ? 1 : detail.total_night;
        }
        else if (booking.booking_type === booking_type.hourly) {
            room_charge = calculateDynamicPrice(booking.checkin_at, booking.checkout_at, basePrice, roomPrice?.weekend_rate, roomPrice?.holiday_rate, holidayDates, booking.booking_type);
            detail.checkin_at = booking.checkin_at;
            detail.checkout_at = booking.checkout_at;
        }
        let discount = 0;
        if (booking.discount_id !== null) {
            const discountInfo = await discountServices.getDiscountById(booking.discount_id);
            if (discountInfo?.discount_type === 'fixed_amount')
                discount = Number(discountInfo.discount_value);
            else if (discountInfo?.discount_type === 'percentage')
                discount = Number(room_charge) * Number(discountInfo.discount_value) / 100;
        }

        const payments = await paymentRepo.getPaymentsByBookingId(bookingId);
        let deposited = 0;
        if (payments.some(payment => payment.is_deposit === true)) {
            deposited = payments.reduce((acc, curr) => {
                if (curr.is_deposit === true)
                    acc += Number(curr.amount)
                return acc;
            }, 0);
        }

        return {
            room_charge: {
                amount: room_charge,
                detail: detail,
            },
            service_charge,
            discount,
            deposited,
            total: room_charge + service_charge,
            balance: room_charge + service_charge - discount - deposited,
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

        const charges = await this.calculateInvoiceAmount(validatedData.booking_id);

        validatedData.room_charge = charges.room_charge.amount;
        validatedData.service_charge = charges.service_charge;
        validatedData.discount_amount = charges.discount;
        validatedData.deposit_used = charges.deposited;
        validatedData.total_amount = charges.total;
        validatedData.amount_due = charges.balance;

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
