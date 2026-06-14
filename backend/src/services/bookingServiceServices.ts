import BookingServiceRepository from '../repositories/bookingServiceRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class BookingServiceService {
    async getAllBookingServices() {
        return await BookingServiceRepository.getAllBookingServices();
    };

    async getBookingServiceById(id) {
        return await BookingServiceRepository.getBookingServiceById(id);
    };

    async createBookingService(data) {
        const validatedData = {
            ...(data.booking_id && { booking_id: data.booking_id.trim() }),
            ...(data.service_id && { service_id: data.service_id.trim() }),
            ...(data.quantity && { quantity: data.quantity }),
            ...(data.unit_price && { unit_price: data.unit_price }),
            ...(data.total_amount && { total_amount: data.total_amount }),
            ...(data.added_by && { added_by: data.added_by.trim() }),
        };

        const validator = new Validator();
        if(validator.isEmpty("Booking ID", validatedData.booking_id)) return;
        if(validator.isEmpty("Service ID", validatedData.service_id)) return;
        if(validator.isEmpty("Quantity", validatedData.quantity)) return;
        if(validator.isEmpty("Unit Price", validatedData.unit_price)) return;
        if(validator.isEmpty("Total Amount", validatedData.total_amount)) return;

        validator.isUUID("Booking ID", validatedData.booking_id);
        validator.isUUID("Service ID", validatedData.service_id);
        validator.isPositiveNumber("Quantity", validatedData.quantity);
        validator.isDecimal("Unit Price", validatedData.unit_price);
        validator.isPositiveNumber("Unit Price", validatedData.unit_price);
        validator.isDecimal("Total Amount", validatedData.total_amount);
        validator.isPositiveNumber("Total Amount", validatedData.total_amount);
        
        if(validatedData.added_by) {
            validator.isUUID("Added By", validatedData.added_by);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await BookingServiceRepository.createBookingService(validatedData);
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
        };

        if(validatedData.quantity) {
            validator.isPositiveNumber("Quantity", validatedData.quantity);
        }
        if(validatedData.unit_price) {
            validator.isDecimal("Unit Price", validatedData.unit_price);
            validator.isPositiveNumber("Unit Price", validatedData.unit_price);
        }
        if(validatedData.total_amount) {
            validator.isDecimal("Total Amount", validatedData.total_amount);
            validator.isPositiveNumber("Total Amount", validatedData.total_amount);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await BookingServiceRepository.updateBookingService(id, validatedData);
    };

    async deleteBookingService(id) {
        return await BookingServiceRepository.deleteBookingService(id);
    };
}

export default new BookingServiceService();
