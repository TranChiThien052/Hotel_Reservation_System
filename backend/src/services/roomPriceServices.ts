import RoomPriceRepository from '../repositories/roomPriceRepo';
import RoomTypeRepository from '../repositories/roomTypeRepo'
import { Validator, ValidationError } from '../middlewares/validateData';
import historyTransactionServices from './historyTransactionServices';
import roomPriceRepo from '../repositories/roomPriceRepo';

class RoomPriceService {
    async getAllRoomPrices() {
        return await RoomPriceRepository.getAllRoomPrices();
    };

    async getRoomPricesByRoomTypeId(id) {
        const roomPrice = await RoomPriceRepository.getRoomPricesByRoomTypeId(id);
        if (!roomPrice) {
            throw new ValidationError('404', "Room price not found for the given room type ID");
        }
        return roomPrice;
    };

    async getRoomPriceById(id) {
        const roomPrice = await RoomPriceRepository.getRoomPriceById(id);
        if (!roomPrice) {
            throw new ValidationError('404', "Room price not found");
        }
        return roomPrice;
    };

    async getRoomPriceByBranchId(id) {
        const validator = new Validator();
        if (!validator.isEmpty("Branch ID", id))
            validator.isUUID("Branch ID", id);
        if (validator.error.length > 0)
            throw new ValidationError("400", validator.clearError());
        return roomPriceRepo.getRoomPriceByBranchId(id);
    }

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

        if (!validator.isEmpty("Room Type ID", validatedData.room_type_id))
            validator.isUUID("Room Type ID", validatedData.room_type_id);

        if (validatedData.price_per_day) {
            validator.isDecimal("Price Per Day", validatedData.price_per_day);
            validator.isNonNegativeNumber("Price Per Day", validatedData.price_per_day);
        }

        if (validatedData.price_per_hour) {
            validator.isDecimal("Price Per Hour", validatedData.price_per_hour);
            validator.isNonNegativeNumber("Price Per Hour", validatedData.price_per_hour);
        }

        if (validatedData.weekend_rate) {
            validator.isDecimal("Weekend Rate", validatedData.weekend_rate);
            validator.isNonNegativeNumber("Weekend Rate", validatedData.weekend_rate);
        }

        if (validatedData.holiday_rate) {
            validator.isDecimal("Holiday Rate", validatedData.holiday_rate);
            validator.isNonNegativeNumber("Holiday Rate", validatedData.holiday_rate);
        }

        if (validatedData.effective_from && validatedData.effective_to) {
            if (validator.validateDateOrder(validatedData.effective_from, validatedData.effective_to)) {
                validatedData.effective_from = new Date(validatedData.effective_from);
                validatedData.effective_to = new Date(validatedData.effective_to);
            }
        } else if (validatedData.effective_from) {
            if (validator.validateDate(validatedData.effective_from)) {
                validatedData.effective_from = new Date(validatedData.effective_from);
            }
        } else if (validatedData.effective_to) {
            if (validator.validateDate(validatedData.effective_to)) {
                validatedData.effective_to = new Date(validatedData.effective_to);
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const roomTypeExists = await RoomTypeRepository.getRoomTypeById(validatedData.room_type_id);
        if (!roomTypeExists) {
            throw new ValidationError('400', "Room type ID not found");
        }

        try {
            const result = await RoomPriceRepository.createRoomPrice(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id,
                    "Room Price",
                    result.id,
                    result
                );
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async updateRoomPrice(id, data) {
        const validatedData = {
            ...(data.price_per_day && { price_per_day: data.price_per_day }),
            ...(data.price_per_hour && { price_per_hour: data.price_per_hour }),
            ...(data.weekend_rate && { weekend_rate: data.weekend_rate }),
            ...(data.holiday_rate && { holiday_rate: data.holiday_rate }),
            ...(data.effective_from && { effective_from: data.effective_from.trim() }),
            ...(data.effective_to && { effective_to: data.effective_to.trim() }),
        }

        const validator = new Validator();

        if (validatedData.price_per_day) {
            validator.isDecimal("Price Per Day", validatedData.price_per_day);
            validator.isNonNegativeNumber("Price Per Day", validatedData.price_per_day);
        }

        if (validatedData.price_per_hour) {
            validator.isDecimal("Price Per Hour", validatedData.price_per_hour);
            validator.isNonNegativeNumber("Price Per Hour", validatedData.price_per_hour);
        }

        if (validatedData.weekend_rate) {
            validator.isDecimal("Weekend Rate", validatedData.weekend_rate);
            validator.isNonNegativeNumber("Weekend Rate", validatedData.weekend_rate);
        }

        if (validatedData.holiday_rate) {
            validator.isDecimal("Holiday Rate", validatedData.holiday_rate);
            validator.isNonNegativeNumber("Holiday Rate", validatedData.holiday_rate);
        }

        if (validatedData.effective_from && validatedData.effective_to) {
            if (validator.validateDateOrder(validatedData.effective_from, validatedData.effective_to)) {
                validatedData.effective_from = new Date(validatedData.effective_from);
                validatedData.effective_to = new Date(validatedData.effective_to);
            }
        } else if (validatedData.effective_from) {
            if (validator.validateDate(validatedData.effective_from)) {
                validatedData.effective_from = new Date(validatedData.effective_from);
            }
        } else if (validatedData.effective_to) {
            if (validator.validateDate(validatedData.effective_to)) {
                validatedData.effective_to = new Date(validatedData.effective_to);
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const existingRoomPrice = await RoomPriceRepository.getRoomPriceById(id);

        if (!existingRoomPrice) {
            throw new ValidationError('400', "Room price not found");
        }

        try {
            const after = await RoomPriceRepository.updateRoomPrice(id, validatedData);
            if (after)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id,
                    "Room Price",
                    id,
                    existingRoomPrice,
                    after,
                    Object.keys(validatedData)
                );
            return after;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async deleteRoomPrice(id) {
        return await RoomPriceRepository.deleteRoomPrice(id);
    };
}

export default new RoomPriceService();