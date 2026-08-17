import BookingServiceRepository from '../repositories/bookingServiceRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import bookingServices from './bookingServices';
import roomServiceSerives from './roomServiceServices';
import accountServices from './accountServices';

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

    async calculateBookingServicesByBookingId(bookingId) {
        const validator = new Validator();
        if (!validator.isUUID("Booking's ID", bookingId)) {
            throw new ValidationError('400', validator.clearError());
        }
        const services = await BookingServiceRepository.getBookingServicesByBookingId(bookingId);
        let total_amount = services.reduce((acc, cur) => {
            acc += Number(cur.total_amount);
            return acc;
        }, 0);
        return {
            services,
            total_amount,
        }
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

        const booking = await bookingServices.getBookingById(validatedData.booking_id);
        if (!booking)
            throw new ValidationError("404", "Booking not found");

        const service = await roomServiceSerives.getServiceById(validatedData.service_id);
        if (!service)
            throw new ValidationError("404", "Service not found");

        const added_by = await accountServices.getAccountById(validatedData.added_by);
        if (!added_by)
            throw new ValidationError("404", "Account not found");

        if (!validator.isEmpty("Quantity", validatedData.quantity))
            validator.isPositiveNumber("Quantity", validatedData.quantity);

        if (!validator.isEmpty("Added_by's ID", validatedData.added_by))
            validator.isUUID("Added_by's ID", validatedData.added_by);

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        validatedData.unit_price = service ? service.price : 0;
        validatedData.total_amount = validatedData.unit_price * validatedData.quantity;
        return await BookingServiceRepository.createBookingService(validatedData);
    };

    async updateBookingService(id, data) {
        const validator = new Validator();
        const existingBookingService = await this.getBookingServiceById(id);
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
        else {
            const account = await accountServices.getAccountById(validatedData.added_by);
            if (!account)
                throw new ValidationError("404", "Account not found");
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        validatedData.total_amount = validatedData.unit_price * validatedData.quantity;
        return await BookingServiceRepository.updateBookingService(id, validatedData);
    };

    async deleteBookingService(id) {
        return await BookingServiceRepository.deleteBookingService(id);
    };
}

export default new BookingServiceService();
