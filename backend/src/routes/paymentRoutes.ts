import express from 'express';
import PaymentController from '../controllers/paymentController.ts';

const router = express.Router();

router.get('/booking/:id', PaymentController.getPaymentsByBookingId);
router.get('/invoice/:id', PaymentController.getPaymentsByInvoiceId);
router.get('/', PaymentController.getAllPayments);
router.get('/:id', PaymentController.getPaymentById);
router.post('/', PaymentController.createPayment);
router.put('/:id', PaymentController.updatePayment);
router.delete('/:id', PaymentController.deletePayment);

export default router;
