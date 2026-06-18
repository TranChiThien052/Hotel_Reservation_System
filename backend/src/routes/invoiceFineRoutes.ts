import express from 'express';
import InvoiceFineController from '../controllers/invoiceFineController.ts';

const router = express.Router();

router.get('/invoice/:id', InvoiceFineController.getInvoiceFinesByInvoiceId);
router.get('/', InvoiceFineController.getAllInvoiceFines);
router.get('/:id', InvoiceFineController.getInvoiceFineById);
router.post('/', InvoiceFineController.createInvoiceFine);
router.put('/:id', InvoiceFineController.updateInvoiceFine);
router.delete('/:id', InvoiceFineController.deleteInvoiceFine);

export default router;
