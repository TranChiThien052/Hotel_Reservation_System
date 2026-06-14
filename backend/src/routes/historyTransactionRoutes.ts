import express from 'express';
import HistoryTransactionController from '../controllers/historyTransactionController.ts';

const router = express.Router();

router.get('/', HistoryTransactionController.getAllTransactions);
router.get('/:id', HistoryTransactionController.getTransactionById);
router.post('/', HistoryTransactionController.createTransaction);
router.delete('/:id', HistoryTransactionController.deleteTransaction);

export default router;
