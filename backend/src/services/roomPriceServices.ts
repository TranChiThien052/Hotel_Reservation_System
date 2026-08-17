import RoomPriceRepository from '../repositories/roomPriceRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import historyTransactionServices from './historyTransactionServices';
import roomPriceRepo from '../repositories/roomPriceRepo';
import roomTypeServices from './roomTypeServices';
import branchServices from './branchServices';

class RoomPriceService {
    async getAllRoomPrices() {
        return await RoomPriceRepository.getAllRoomPrices();
    };

    async getRoomPricesByRoomTypeId(id) {
        const roomType = await roomTypeServices.getRoomTypeById(id);
        if (!roomType)
            throw new ValidationError("404", "Room type not found")
        const roomPrice = await RoomPriceRepository.getRoomPricesByRoomTypeId(id);
        if (!roomPrice) {
            throw new ValidationError('404', "Room price not found");
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
        const branch = await branchServices.getBranchById(id);
        if (!branch)
            throw new ValidationError("404", "Branch not found");
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

        const roomType = await roomTypeServices.getRoomTypeById(validatedData.room_type_id);
        if (!roomType)
            throw new ValidationError("404", "Room Type not found");

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

        try {
            const result = await RoomPriceRepository.createRoomPrice(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id,
                    "Giá phòng",
                    result.id,
                    result
                );
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async updateRoomPrice(id, data) {
        const existingPrice = await this.getRoomPriceById(id);
        if (!existingPrice)
            throw new ValidationError("404", "Room Price not found");
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

        try {
            const after = await RoomPriceRepository.updateRoomPrice(id, validatedData);
            if (after)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id,
                    "Giá phòng",
                    id,
                    existingPrice,
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