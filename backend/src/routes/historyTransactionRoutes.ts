import express from 'express';
import HistoryTransactionController from '../controllers/historyTransactionController';

const router = express.Router();

/**
 * @swagger
 * /history-transactions/account/{id}:
 *   get:
 *     summary: Get data
 *     tags: [HistoryTransaction]
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
router.get('/account/:id', HistoryTransactionController.getTransactionsByAccountId);
/**
 * @swagger
 * /history-transactions:
 *   get:
 *     summary: Get data
 *     tags: [HistoryTransaction]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', HistoryTransactionController.getAllTransactions);
/**
 * @swagger
 * /history-transactions/{id}:
 *   get:
 *     summary: Get data
 *     tags: [HistoryTransaction]
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
router.get('/:id', HistoryTransactionController.getTransactionById);
/**
 * @swagger
 * /history-transactions:
 *   post:
 *     summary: Create new record
 *     tags: [HistoryTransaction]
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
router.post('/', HistoryTransactionController.createTransaction);
/**
 * @swagger
 * /history-transactions/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [HistoryTransaction]
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
router.delete('/:id', HistoryTransactionController.deleteTransaction);

export default router;
