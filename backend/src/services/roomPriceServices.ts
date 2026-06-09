import RoomPriceRepository from '../repositories/roomPriceRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class RoomPriceService {
    async getAllRoomPrices() {
        return await RoomPriceRepository.getAllRoomPrices();
    };

    async getRoomPricesByRoomTypeId(id) {
        return await RoomPriceRepository.getRoomPricesByRoomTypeId(id);
    };

    async getRoomPriceById(id) {
        return await RoomPriceRepository.getRoomPriceById(id);
    };

    async createRoomPrice(data) {
        const validatedData = {
        ...(data.room_type_id && { room_type_id: data.room_type_id.trim() }),
        ...(data.price_per_day && { price_per_day: data.price_per_day }),
        ...(data.price_per_hour && { price_per_hour: data.price_per_hour }),
        ...(data.weekend_rate && { weekend_rate: data.weekend_rate }),
        ...(data.holiday_rate && { holiday_rate: data.holiday_rate }),
        ...(data.effective_from && { effective_from: data.effective_from.trim() }),
        ...(data.effective_to && { effective_to: data.effective_to.trim() }),
        }

        const validator = new Validator();
        validator.isEmpty("Room Type ID", validatedData.room_type_id);
        validator.isNumber("Price Per Day", validatedData.price_per_day);
        validator.isNumber("Price Per Hour", validatedData.price_per_hour);
        validator.isNumber("Weekend Rate", validatedData.weekend_rate);
        validator.isNumber("Holiday Rate", validatedData.holiday_rate);
        validator.validateDateOrder(validatedData.effective_from, validatedData.effective_to);

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const roomPriceExists = await RoomPriceRepository.getRoomPricesByRoomTypeId(validatedData.room_type_id);

        if (roomPriceExists.length > 0) {
            validator.pushError("Room price for this room type already exists");
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await RoomPriceRepository.createRoomPrice(data);
    };

    async updateRoomPrice(id, data) {
        const validator = new Validator();
        const validatedData = {
        ...(data.price_per_day && { price_per_day: data.price_per_day }),
        ...(data.price_per_hour && { price_per_hour: data.price_per_hour }),
        ...(data.weekend_rate && { weekend_rate: data.weekend_rate }),
        ...(data.holiday_rate && { holiday_rate: data.holiday_rate }),
        ...(data.effective_from && { effective_from: data.effective_from.trim() }),
        ...(data.effective_to && { effective_to: data.effective_to.trim() }),
        }

        validator.isNumber("Price Per Day", validatedData.price_per_day);
        validator.isNumber("Price Per Hour", validatedData.price_per_hour);
        validator.isNumber("Weekend Rate", validatedData.weekend_rate);
        validator.isNumber("Holiday Rate", validatedData.holiday_rate);

        validator.validateDateOrder(validatedData.effective_from, validatedData.effective_to);

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const roomPriceExists = await RoomPriceRepository.getRoomPriceById(id);

        if (!roomPriceExists) {
            validator.pushError("Room price not found");
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await RoomPriceRepository.updateRoomPrice(id, validatedData);
    };

    async deleteRoomPrice(id) {
        return await RoomPriceRepository.deleteRoomPrice(id);
    };
}

export default new RoomPriceService();