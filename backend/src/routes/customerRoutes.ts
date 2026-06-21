import express from 'express';
import CustomerController from '../controllers/customerController';

const router = express.Router();

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get data
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', CustomerController.getAllCustomers);
/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Customer]
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
router.get('/:id', CustomerController.getCustomerById);
/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create new record
 *     tags: [Customer]
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
router.post('/', CustomerController.createCustomer);
/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Customer]
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
router.put('/:id', CustomerController.updateCustomer);
/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Customer]
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
router.delete('/:id', CustomerController.deleteCustomer);

export default router;
