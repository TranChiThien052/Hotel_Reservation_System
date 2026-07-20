import DiscountService from '../services/discountServices';

class DiscountController {
    async getAllDiscounts(req, res) {
        return await DiscountService.getAllDiscounts()
            .then(discounts => res.status(200).json(discounts))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getDiscountById(req, res) {
        const { id } = req.params;
        return await DiscountService.getDiscountById(id)
            .then(discount => {
                if (!discount) {
                    return res.status(404).json({ error: "Discount not found" });
                }
                res.status(200).json(discount);
            })
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getDiscountByBranchId(req, res) {
        const { id } = req.params;
        return await DiscountService.getDiscountByBranchId(id)
            .then(discounts => res.status(200).json(discounts))
            .catch(error => res.status(500).json({ error }));
    };

    async createDiscount(req, res) {
        const { branch_id, code, description, discount_type, discount_value, min_order_value, usage_limit, valid_from, valid_to, is_active } = req.body;
        const data = { branch_id, code, description, discount_type, discount_value, min_order_value, usage_limit, valid_from, valid_to, is_active, log_account_id: req.user?.account_id };
        return await DiscountService.createDiscount(data)
            .then(createdDiscount => res.status(201).json(createdDiscount))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateDiscount(req, res) {
        const { id } = req.params;
        const { branch_id, code, description, discount_type, discount_value, min_order_value, usage_limit, valid_from, valid_to, is_active } = req.body;
        const data = { branch_id, code, description, discount_type, discount_value, min_order_value, usage_limit, valid_from, valid_to, is_active, log_account_id: req.user?.account_id };
        return await DiscountService.updateDiscount(id, data)
            .then(updatedDiscount => res.status(200).json(updatedDiscount))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            }
            );
    };

    async deleteDiscount(req, res) {
        const { id } = req.params;
        return await DiscountService.deleteDiscount(id)
            .then(deletedDiscount => res.status(200).json(deletedDiscount))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new DiscountController();