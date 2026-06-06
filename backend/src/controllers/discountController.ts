import DiscountService from '../services/discountServices.ts';

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

    async createDiscount(req, res) {
        const data = req.body;
        return await DiscountService.createDiscount(data)
        .then(createdDiscount => res.status(201).json(createdDiscount))
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async updateDiscount(req, res) {
        const { id } = req.params;
        const data = req.body;
        return await DiscountService.updateDiscount(id, data)
        .then(updatedDiscount => res.status(200).json(updatedDiscount))
        .catch(error => {
            if (error.message === "Discount not found") {
                return res.status(404).json({ error: error.message });
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
            if (error.message === "Discount not found") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };
}

export default new DiscountController();