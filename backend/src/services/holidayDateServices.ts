import HolidayDateRepository from '../repositories/holidayDateRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class HolidayDateService {
    async getAllHolidayDates() {
        return await HolidayDateRepository.getAllHolidayDates();
    };

    async getHolidayDateById(id) {
        return await HolidayDateRepository.getHolidayDateById(id);
    };

    async createHolidayDate(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id.trim() }),
            ...(data.date && { date: data.date }),
            ...(data.name && { name: data.name.trim() }),
        };

        const validator = new Validator();
        if(validator.isEmpty("Branch ID", validatedData.branch_id)) return;
        if(validator.isEmpty("Date", validatedData.date)) return;

        validator.isUUID("Branch ID", validatedData.branch_id);
        validator.validateDate(validatedData.date);
        
        if(validatedData.name) {
            validator.isString("Name", validatedData.name);
            validator.maxLength("Name", validatedData.name, 150);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await HolidayDateRepository.createHolidayDate(validatedData);
    };

    async updateHolidayDate(id, data) {
        const validator = new Validator();
        const existingHolidayDate = await HolidayDateRepository.getHolidayDateById(id);
        if (!existingHolidayDate) {
            throw new ValidationError('404', "Holiday date not found");
        }

        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id.trim() }),
            ...(data.date && { date: data.date }),
            ...(data.name && { name: data.name.trim() }),
        };

        if(validatedData.branch_id) {
            validator.isUUID("Branch ID", validatedData.branch_id);
        }
        if(validatedData.date) {
            validator.validateDate(validatedData.date);
        }
        if(validatedData.name) {
            validator.isString("Name", validatedData.name);
            validator.maxLength("Name", validatedData.name, 150);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await HolidayDateRepository.updateHolidayDate(id, validatedData);
    };

    async deleteHolidayDate(id) {
        return await HolidayDateRepository.deleteHolidayDate(id);
    };
}

export default new HolidayDateService();
