import DiscountRepository from '../repositories/discountRepo.ts';
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
            ...(data.branch_id && { branch_id: data.branch_id.trim() }),
            ...(data.code && { code: data.code.trim() }),
            ...(data.description && { description: data.description.trim() }),
            ...(data.discount_type && { discount_type: data.discount_type.trim() }),
            ...(data.discount_value && { discount_value: data.discount_value }),
            ...(data.min_order_value && { min_order_value: data.min_order_value }),
            ...(data.usage_limit && { usage_limit: data.usage_limit }),
            ...(data.valid_from && { valid_from: data.valid_from.trim() }),
            ...(data.valid_to && { valid_to: data.valid_to.trim() }),
            ...(data.is_active && { is_active: data.is_active }),
        };

        const validator = new Validator();
        validator.isEmpty("Code", validatedData.code);

        if (validator.isEmpty("Discount Type", validatedData.discount_type)){
            validator.validateDiscountType(validatedData.discount_type);
        }
        
        validator.isEmpty("Discount Value", validatedData.discount_value);
        
        validator.validateDateOrder(validatedData.valid_from, validatedData.valid_to);

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await DiscountRepository.createDiscount(validatedData);
    };

    async updateDiscount(id, data) {
        const validator = new Validator();
        const existingDiscount = await DiscountRepository.getDiscountById(id);
        if (!existingDiscount) {
            throw new ValidationError('404', "Discount not found");
        }
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id.trim() }),
            ...(data.code && { code: data.code.trim() }),
            ...(data.description && { description: data.description.trim() }),
            ...(data.discount_type && { discount_type: data.discount_type.trim() }),
            ...(data.discount_value && { discount_value: data.discount_value }),
            ...(data.min_order_value && { min_order_value: data.min_order_value }),
            ...(data.usage_limit && { usage_limit: data.usage_limit }),
            ...(data.valid_from && { valid_from: data.valid_from.trim() }),
            ...(data.valid_to && { valid_to: data.valid_to.trim() }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        validator.validateDiscountType(validatedData.discount_type);

        validator.validateDateOrder(validatedData.valid_from, validatedData.valid_to);

        return await DiscountRepository.updateDiscount(id, validatedData);
    };

    async deleteDiscount(id) {
        return await DiscountRepository.deleteDiscount(id);
    };
}

export default new DiscountServices();  