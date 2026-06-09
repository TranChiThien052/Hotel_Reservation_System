import express from 'express';
import DiscountController from '../controllers/discountController.ts';

const router = express.Router();

router.get('/', (req, res) => {
    DiscountController.getAllDiscounts(req, res);
});

router.get('/:id', (req, res) => {
    DiscountController.getDiscountById(req, res);
});

router.post('/', (req, res) => {
    DiscountController.createDiscount(req, res);
});

router.put('/:id', (req, res) => {
    DiscountController.updateDiscount(req, res);
});

router.delete('/:id', (req, res) => {
    DiscountController.deleteDiscount(req, res);
});

export default router;