import express from 'express';
import InvoiceController from '../controllers/invoiceController';

const router = express.Router();

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: Get data
 *     tags: [Invoice]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', InvoiceController.getAllInvoices);
/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Invoice]
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
router.get('/:id', InvoiceController.getInvoiceById);
/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create new record
 *     tags: [Invoice]
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
router.post('/', InvoiceController.createInvoice);
/**
 * @swagger
 * /invoices/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Invoice]
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
router.put('/:id', InvoiceController.updateInvoice);
/**
 * @swagger
 * /invoices/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Invoice]
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
router.delete('/:id', InvoiceController.deleteInvoice);

export default router;
