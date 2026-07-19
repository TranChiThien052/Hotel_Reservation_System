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
 *         content:
 *            application/json:
 *               schema:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *                       action:
 *                         type: string
 *                       target_type:
 *                         type: string
 *                       target_id:
 *                         type: string
 *                       description:
 *                         type: string
 *                       metadata:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                       accounts:
 *                         type: object
 *                         properties:
 *                            id:
 *                              type: string
 *                            customers:
 *                              type: object
 *                              properties:
 *                                 full_name:
 *                                   type: string
 *                            staff:
 *                              type: object
 *                              properties:
 *                                 full_name:
 *                                   type: string
 *                            branches:
 *                              type: object
 *                              properties:
 *                                 name:
 *                                   type: string
 *                            role:
 *                              type: string
 *       500:
 *         description: Internal server error
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
 *         content:
 *            application/json:
 *               schema:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *                       action:
 *                         type: string
 *                       target_type:
 *                         type: string
 *                       target_id:
 *                         type: string
 *                       description:
 *                         type: string
 *                       metadata:
 *                         type: object
 *                       created_at:
 *                         type: string
 *                       accounts:
 *                         type: object
 *                         properties:
 *                            id:
 *                              type: string
 *                            customers:
 *                              type: object
 *                              properties:
 *                                 full_name:
 *                                   type: string
 *                            staff:
 *                              type: object
 *                              properties:
 *                                 full_name:
 *                                   type: string
 *                            branches:
 *                              type: object
 *                              properties:
 *                                 name:
 *                                   type: string
 *                            role:
 *                              type: string
 *       500:
 *         description: Internal server error
 *       404:
 *         description: Account not found
 *       400:
 *         description: Invalid data
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
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     id:
 *                        type: string
 *                     action:
 *                        type: string
 *                     target_tpe:
 *                        type: string
 *                     target_id:
 *                        type: string
 *                        format: uuid
 *                     description:
 *                        type: string
 *                     metadata:
 *                        type: object
 *                     created_at:
 *                        type: string
 *                     accounts:
 *                        type: object
 *                        properties:
 *                          id:
 *                            type: string
 *                          customers:
 *                            type: object
 *                            properties:
 *                              full_name:
 *                                type: string
 *                          staff:
 *                            type: object
 *                            properties:
 *                              full_name:
 *                                type: string
 *                          branches:
 *                            type: object
 *                            properties:
 *                              name:
 *                                type: string
 *                          role:
 *                            type: string
 *       500:
 *         description: Internal server error
 */
router.get('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => HistoryTransactionController.getTransactionById(req, res))
});

router.get('/target-type/:target_type', (req, res) => {
    return authorize(req, res, ["manager", "admin"], () => HistoryTransactionController.getTransactionsByTargetType(req, res))
})
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

export default router;
