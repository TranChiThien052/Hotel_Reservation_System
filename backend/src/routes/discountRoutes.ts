import express from 'express';
import DiscountController from '../controllers/discountController';

const router = express.Router();

router.get('/', DiscountController.getAllDiscounts);

router.get('/:id', DiscountController.getDiscountById);

router.post('/', DiscountController.createDiscount);

router.put('/:id', DiscountController.updateDiscount);

router.delete('/:id', DiscountController.deleteDiscount);

export default router;