import DiscountRepository from '../repositories/discountRepo.ts';

class DiscountServices {
    async getAllDiscounts() {
        return await DiscountRepository.getAllDiscounts();
    };

    async getDiscountById(id) {
        return await DiscountRepository.getDiscountById(id);
    };

    async createDiscount(data) {
        return await DiscountRepository.createDiscount(data);
    };

    async updateDiscount(id, data) {
        const existingDiscount = await DiscountRepository.getDiscountById(id);
        if (!existingDiscount) {
            throw new Error("Discount not found");
        }
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
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };
        return await DiscountRepository.updateDiscount(id, validatedData);
    };

    async deleteDiscount(id) {
        return await DiscountRepository.deleteDiscount(id);
    };
}

export default new DiscountServices();