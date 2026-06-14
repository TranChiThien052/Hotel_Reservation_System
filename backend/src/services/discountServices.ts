import DiscountRepository from '../repositories/discountRepo.ts';
import BranchRepository from '../repositories/branchRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class DiscountServices {
    async getAllDiscounts() {
        return await DiscountRepository.getAllDiscounts();
    };

    async getDiscountById(id) {
        return await DiscountRepository.getDiscountById(id);
    };

    async createDiscount(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.code && { code: data.code }),
            ...(data.description && { description: data.description }),
            ...(data.discount_type && { discount_type: data.discount_type }),
            ...(data.discount_value && { discount_value: data.discount_value }),
            ...(data.min_order_value && { min_order_value: data.min_order_value }),
            ...(data.usage_limit && { usage_limit: data.usage_limit }),
            ...(data.valid_from && { valid_from: data.valid_from }),
            ...(data.valid_to && { valid_to: data.valid_to }),
            ...(data.is_active && { is_active: data.is_active }),
        };

        const validator = new Validator();
        
        if (!validator.isEmpty("Code", validatedData.code)) {
            validator.isString("Code", validatedData.code);
        }

        if (!validator.isEmpty("Discount Type", validatedData.discount_type)) {
            validator.validateDiscountType(validatedData.discount_type);
        }

        if (validatedData.discount_value !== undefined) {
            validator.isDecimal("Discount Value", validatedData.discount_value);
            validator.isNonNegativeNumber("Discount Value", validatedData.discount_value);
        }

        if (validatedData.min_order_value !== undefined) {
            validator.isDecimal("Min Order Value", validatedData.min_order_value);
            validator.isNonNegativeNumber("Min Order Value", validatedData.min_order_value);
        }

        if (validatedData.usage_limit !== undefined) {
            validator.isPositiveNumber("Usage Limit", validatedData.usage_limit);
        }

        if (validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if(validator.validateDateOrder(validatedData.valid_from, validatedData.valid_to)) {
            if (new Date(validatedData.valid_from).getTime() < new Date().getTime()) {
                validator.pushError("Valid From date cannot be in the past");
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.branch_id) {
            const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
            if (!branchExists) {
                throw new ValidationError('400', "Invalid branch ID");
            }
        }

        return await DiscountRepository.createDiscount(validatedData);
    };

    async updateDiscount(id, data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.code && { code: data.code }),
            ...(data.description && { description: data.description  }),
            ...(data.discount_type && { discount_type: data.discount_type }),
            ...(data.discount_value && { discount_value: data.discount_value }),
            ...(data.min_order_value && { min_order_value: data.min_order_value }),
            ...(data.usage_limit && { usage_limit: data.usage_limit }),
            ...(data.valid_from && { valid_from: data.valid_from }),
            ...(data.valid_to && { valid_to: data.valid_to }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        
        const validator = new Validator();

        if(validatedData.code) {
            validator.isString("Code", validatedData.code);
        }
        if(validatedData.discount_type) {
            validator.validateDiscountType(validatedData.discount_type);
        }
        if(validatedData.discount_value !== undefined) {
            validator.isDecimal("Discount Value", validatedData.discount_value);
            validator.isNonNegativeNumber("Discount Value", validatedData.discount_value);
        }
        if(validatedData.min_order_value !== undefined) {
            validator.isDecimal("Min Order Value", validatedData.min_order_value);
            validator.isNonNegativeNumber("Min Order Value", validatedData.min_order_value);
        }
        if(validatedData.usage_limit !== undefined) {
            validator.isPositiveNumber("Usage Limit", validatedData.usage_limit);
        }
        if(validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }
        
        if(validator.validateDateOrder(validatedData.valid_from, validatedData.valid_to)) {
            if (new Date(validatedData.valid_from).getTime() < new Date().getTime()) {
                validator.pushError("Valid From date cannot be in the past");
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        if (validatedData.branch_id) {
            const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
            if (!branchExists) {
                throw new ValidationError('400', "Invalid branch ID");
            }
        }

        const existingDiscount = await DiscountRepository.getDiscountById(id);
        if (!existingDiscount) {
            throw new ValidationError('404', "Discount not found");
        }

        return await DiscountRepository.updateDiscount(id, validatedData);
    };

    async deleteDiscount(id) {
        return await DiscountRepository.deleteDiscount(id);
    };
}

export default new DiscountServices();  