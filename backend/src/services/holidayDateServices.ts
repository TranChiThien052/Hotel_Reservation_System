import HolidayDateRepository from '../repositories/holidayDateRepo.ts';
import BranchRepository from '../repositories/branchRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class HolidayDateService {
    async getAllHolidayDates() {
        return await HolidayDateRepository.getAllHolidayDates();
    };

    async getHolidayDateById(id) {
        const validator = new Validator();
        if (!validator.isUUID("Holiday Date ID", id)) {
            throw new ValidationError('400', "Invalid holiday date ID format");
        }
        return await HolidayDateRepository.getHolidayDateById(id);
    };

    async createHolidayDate(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.date && { date: data.date }),
            ...(data.name && { name: data.name }),
        };

        const validator = new Validator();
        if (validatedData.branch_id) {
            if (validator.isUUID("Branch ID", validatedData.branch_id)) {
                const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
                if (!branchExists) {
                    validator.pushError("Branch ID does not exist");
                }
            }    
        }

        if (!validator.isEmpty("Date", validatedData.date)) {
            if(validator.validateDate(validatedData.date))
                validatedData.date = new Date(validatedData.date);
        }

        if (validatedData.name) {
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

        if(!validator.isEmpty("Holiday Date ID", id)) {
            if (!validator.isUUID("Holiday Date ID", id)) {
                throw new ValidationError('400', validator.clearError());
            }
        }

        const existingHolidayDate = await HolidayDateRepository.getHolidayDateById(id);

        if (!existingHolidayDate) {
            throw new ValidationError('404', "Holiday date not found");
        }

        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.date && { date: data.date }),
            ...(data.name && { name: data.name }),
        };

        if(validatedData.branch_id) {
            if (validator.isUUID("Branch ID", validatedData.branch_id)) {
                const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
                if (!branchExists) {
                    validator.pushError("Branch ID does not exist");
                }
            }
        }

        if(validatedData.date) {
            if (validator.validateDate(validatedData.date))
                validatedData.date = new Date(validatedData.date);
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
