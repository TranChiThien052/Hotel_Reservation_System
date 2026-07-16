import express from 'express';
import DiscountController from '../controllers/discountController';
import { authorize } from '../middlewares/authorizer';

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
router.get('/', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => DiscountController.getAllDiscounts(req, res))
});

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
router.get('/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], DiscountController.getDiscountById(req, res))
});

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
router.post('/', (req, res) => {
    authorize(req, res, ["manager", "admin"], DiscountController.createDiscount(req, res))
});

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
router.put('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], DiscountController.updateDiscount(req, res))
});

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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], DiscountController.deleteDiscount(req, res))
});

export default router;