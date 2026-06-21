import express from 'express';
import PaymentController from '../controllers/paymentController';

const router = express.Router();

/**
 * @swagger
 * /payments/booking/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Payment]
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
router.get('/booking/:id', PaymentController.getPaymentsByBookingId);
/**
 * @swagger
 * /payments/invoice/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Payment]
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
router.get('/invoice/:id', PaymentController.getPaymentsByInvoiceId);
/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get data
 *     tags: [Payment]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', PaymentController.getAllPayments);
/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Payment]
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
router.get('/:id', PaymentController.getPaymentById);
/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create new record
 *     tags: [Payment]
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
router.post('/', PaymentController.createPayment);
/**
 * @swagger
 * /payments/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Payment]
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
router.put('/:id', PaymentController.updatePayment);
/**
 * @swagger
 * /payments/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Payment]
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
router.delete('/:id', PaymentController.deletePayment);

export default router;
