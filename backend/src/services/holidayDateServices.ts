import HolidayDateRepository from '../repositories/holidayDateRepo';
import BranchRepository from '../repositories/branchRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import historyTransactionServices from './historyTransactionServices';
import branchServices from './branchServices';

class HolidayDateService {
    async getAllHolidayDates() {
        return await HolidayDateRepository.getAllHolidayDates();
    };

    async getHolidayDatesByBranchId(branchId) {
        const validator = new Validator();
        if (!validator.isUUID("Branch ID", branchId))
            throw new ValidationError("400", validator.clearError());
        return await HolidayDateRepository.getHolidayDatesByBranchId(branchId);
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
            const branchExists = await branchServices.getBranchById(validatedData.branch_id);
            if (!branchExists) {
                throw new ValidationError("404", "Branch not found");
            }
        }

        if (!validator.isEmpty("Date", validatedData.date)) {
            if (validator.validateDate(validatedData.date))
                validatedData.date = new Date(validatedData.date);
        }

        if (validatedData.name) {
            validator.isString("Name", validatedData.name);
            validator.maxLength("Name", validatedData.name, 150);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        try {
            const result = await HolidayDateRepository.createHolidayDate(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id ?? null,
                    "Ngày lễ",
                    result.id,
                    result
                )
            return result;
        } catch (error: any) {
            throw new Error(error)
        }
    };

    async updateHolidayDate(id, data) {
        const validator = new Validator();

        const existingHolidayDate = await this.getHolidayDateById(id);

        if (!existingHolidayDate) {
            throw new ValidationError('404', "Holiday date not found");
        }

        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.date && { date: data.date }),
            ...(data.name && { name: data.name }),
        };

        if (validatedData.branch_id) {
            const branchExists = await branchServices.getBranchById(validatedData.branch_id);
            if (!branchExists) {
                throw new ValidationError("404", "Branch not found");
            }
        }

        if (validatedData.date) {
            if (validator.validateDate(validatedData.date))
                validatedData.date = new Date(validatedData.date);
        }

        if (validatedData.name) {
            validator.isString("Name", validatedData.name);
            validator.maxLength("Name", validatedData.name, 150);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        try {
            const before = await HolidayDateRepository.getHolidayDateById(id);
            const after = await HolidayDateRepository.updateHolidayDate(id, validatedData);
            if (after)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id ?? null,
                    "Ngày lễ",
                    id,
                    before,
                    after,
                    Object.keys(validatedData)
                )
            return after;
        } catch (error: any) {
            throw new Error(error)
        }
    };

    async deleteHolidayDate(id) {
        return await HolidayDateRepository.deleteHolidayDate(id);
    };
}

export default new HolidayDateService();
