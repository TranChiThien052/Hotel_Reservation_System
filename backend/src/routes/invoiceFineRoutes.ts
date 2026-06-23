import express from 'express';
import InvoiceFineController from '../controllers/invoiceFineController';

const router = express.Router();

/**
 * @swagger
 * /invoice-fines/invoice/{id}:
 *   get:
 *     summary: Get data
 *     tags: [InvoiceFine]
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
router.get('/invoice/:id', InvoiceFineController.getInvoiceFinesByInvoiceId);
/**
 * @swagger
 * /invoice-fines:
 *   get:
 *     summary: Get data
 *     tags: [InvoiceFine]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', InvoiceFineController.getAllInvoiceFines);
/**
 * @swagger
 * /invoice-fines/{id}:
 *   get:
 *     summary: Get data
 *     tags: [InvoiceFine]
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
router.get('/:id', InvoiceFineController.getInvoiceFineById);
/**
 * @swagger
 * /invoice-fines:
 *   post:
 *     summary: Create new record
 *     tags: [InvoiceFine]
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
router.post('/', InvoiceFineController.createInvoiceFine);
/**
 * @swagger
 * /invoice-fines/{id}:
 *   put:
 *     summary: Update record
 *     tags: [InvoiceFine]
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
router.put('/:id', InvoiceFineController.updateInvoiceFine);
/**
 * @swagger
 * /invoice-fines/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [InvoiceFine]
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
router.delete('/:id', InvoiceFineController.deleteInvoiceFine);

export default router;
