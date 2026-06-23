import express from 'express';
import DiscountController from '../controllers/discountController';

const router = express.Router();

/**
 * @swagger
 * /discounts:
 *   get:
 *     summary: Get data
 *     tags: [Discount]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', DiscountController.getAllDiscounts);

/**
 * @swagger
 * /discounts/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Discount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/:id', DiscountController.getDiscountById);

/**
 * @swagger
 * /discounts:
 *   post:
 *     summary: Create new record
 *     tags: [Discount]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post('/', DiscountController.createDiscount);

/**
 * @swagger
 * /discounts/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Discount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put('/:id', DiscountController.updateDiscount);

/**
 * @swagger
 * /discounts/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Discount]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.delete('/:id', DiscountController.deleteDiscount);

export default router;