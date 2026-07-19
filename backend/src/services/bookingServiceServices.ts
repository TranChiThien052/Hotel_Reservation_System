import BookingServiceRepository from '../repositories/bookingServiceRepo';
import BookingRepository from '../repositories/bookingRepo';
import RoomServiceRepository from '../repositories/roomServiceRepo';
import AccountRepository from '../repositories/accountRepo';
import HistoryTransactionService from './historyTransactionServices'
import { Validator, ValidationError } from '../middlewares/validateData';

class BookingServiceService {
    async getAllBookingServices() {
        return await BookingServiceRepository.getAllBookingServices();
    };

    async getBookingServiceById(id) {
        const validator = new Validator();
        if (!validator.isUUID("Booking Service's ID", id)) {
            throw new ValidationError('400', validator.clearError());
        }
        return await BookingServiceRepository.getBookingServiceById(id);
    };

    async getBookingServicesByBookingId(bookingId) {
        const validator = new Validator();
        if (!validator.isUUID("Booking's ID", bookingId)) {
            throw new ValidationError('400', validator.clearError());
        }
        return await BookingServiceRepository.getBookingServicesByBookingId(bookingId);
    };

    async createBookingService(data) {
        const validatedData = {
            ...(data.booking_id && { booking_id: data.booking_id }),
            ...(data.service_id && { service_id: data.service_id }),
            ...(data.quantity && { quantity: data.quantity }),
            ...(data.unit_price && { unit_price: data.unit_price }),
            ...(data.total_amount && { total_amount: data.total_amount }),
            ...(data.added_by && { added_by: data.added_by }),
        };

        const validator = new Validator();

        if (!validator.isEmpty("Booking ID", validatedData.booking_id))
            validator.isUUID("Booking ID", validatedData.booking_id);

        if (!validator.isEmpty("Service ID", validatedData.service_id))
            validator.isUUID("Service ID", validatedData.service_id);

        if (!validator.isEmpty("Quantity", validatedData.quantity))
            validator.isPositiveNumber("Quantity", validatedData.quantity);

        if (!validator.isEmpty("Added_by's ID", validatedData.added_by))
            validator.isUUID("Added_by's ID", validatedData.added_by);

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const booking = await BookingRepository.getBookingById(validatedData.booking_id);
        if (!booking) {
            validator.pushError("Booking not found");
        }

        const roomService = await RoomServiceRepository.getServiceById(validatedData.service_id);
        if (!roomService) {
            validator.pushError("Service not found");
        }

        const account = await AccountRepository.getAccountById(validatedData.added_by);
        if (!account) {
            validator.pushError("Added_by's ID not found");
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        validatedData.unit_price = roomService ? roomService.price : 0;
        validatedData.total_amount = validatedData.unit_price * validatedData.quantity;
        try {
            const result = await BookingServiceRepository.createBookingService(validatedData);
            if (result)
                await HistoryTransactionService.createCreateTransaction(
                    data.log_account_id ?? null,
                    "Booking Service",
                    result.id,
                    result
                )
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async updateBookingService(id, data) {
        const validator = new Validator();
        const existingBookingService = await BookingServiceRepository.getBookingServiceById(id);
        if (!existingBookingService) {
            throw new ValidationError('404', "Booking service not found");
        }

        const validatedData = {
            ...(data.quantity && { quantity: data.quantity }),
            ...(data.unit_price && { unit_price: data.unit_price }),
            ...(data.total_amount && { total_amount: data.total_amount }),
            ...(data.added_by && { added_by: data.added_by }),
        };

        if (validatedData.quantity) {
            validator.isPositiveNumber("Quantity", validatedData.quantity);
        } else {
            validatedData.quantity = existingBookingService.quantity;
        }
        if (validatedData.unit_price) {
            validator.isDecimal("Unit Price", validatedData.unit_price);
            validator.isPositiveNumber("Unit Price", validatedData.unit_price);
        } else {
            validatedData.unit_price = existingBookingService.unit_price;
        }

        if (!validatedData.added_by)
            validatedData.added_by = existingBookingService.added_by;

        if (validator.isUUID("Added_by's ID", validatedData.added_by)) {
            const account = await AccountRepository.getAccountById(validatedData.added_by);
            if (!account) {
                validator.pushError("Added_by's ID not found");
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        validatedData.total_amount = validatedData.unit_price * validatedData.quantity;

        try {
            const before = await BookingServiceRepository.getBookingServiceById(id)
            const result = await BookingServiceRepository.updateBookingService(id, validatedData);
            if (result)
                await HistoryTransactionService.createUpdateTransaction(
                    data.log_account_id ?? null,
                    "Booking Service",
                    id,
                    before,
                    result,
                    Object.keys(validatedData),
                )
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async deleteBookingService(id) {
        return await BookingServiceRepository.deleteBookingService(id);
    };
}

export default new BookingServiceService();
