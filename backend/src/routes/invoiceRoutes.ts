import express from 'express';
import InvoiceController from '../controllers/invoiceController';
import { authorize } from '../middlewares/authorizer';

const router = express.Router();

router.get('booking/:id', (req, res) => {
    authorize(req, res, ["staff", "manager"], () => InvoiceController.getInvoiceByBookingId(req, res))
})
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
router.get('/', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => InvoiceController.getAllInvoices(req, res))
});
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
router.get('/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => InvoiceController.getInvoiceById(req, res))
});
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
router.post('/', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => InvoiceController.createInvoice(req, res))
});
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
router.put('/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => InvoiceController.updateInvoice(req, res))
});
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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => InvoiceController.deleteInvoice(req, res))
});

/**
 * @swagger
 * /invoices/calculate/{id}:
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
router.get('/calculate/:id', InvoiceController.calculateInvoice);

export default router;
