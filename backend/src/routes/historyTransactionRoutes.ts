import express from 'express';
import HistoryTransactionController from '../controllers/historyTransactionController';
import { authorize } from '../middlewares/authorizer';

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
router.get('/account/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => HistoryTransactionController.getTransactionsByAccountId(req, res))
});
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
router.get('/', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => HistoryTransactionController.getAllTransactions(req, res))
});
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
router.get('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => HistoryTransactionController.getTransactionById(req, res))
});
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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => HistoryTransactionController.deleteTransaction(req, res))
});

export default router;
