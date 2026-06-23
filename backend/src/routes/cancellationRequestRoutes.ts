import express from 'express';
import CancellationRequestController from '../controllers/cancellationRequestController';

const router = express.Router();

/**
 * @swagger
 * /cancellation-requests:
 *   get:
 *     summary: Get data
 *     tags: [CancellationRequest]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', CancellationRequestController.getAllCancellationRequests);
/**
 * @swagger
 * /cancellation-requests/{id}:
 *   get:
 *     summary: Get data
 *     tags: [CancellationRequest]
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
router.get('/:id', CancellationRequestController.getCancellationRequestById);
/**
 * @swagger
 * /cancellation-requests:
 *   post:
 *     summary: Create new record
 *     tags: [CancellationRequest]
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
router.post('/', CancellationRequestController.createCancellationRequest);
/**
 * @swagger
 * /cancellation-requests/{id}:
 *   put:
 *     summary: Update record
 *     tags: [CancellationRequest]
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
router.put('/:id', CancellationRequestController.updateCancellationRequest);
/**
 * @swagger
 * /cancellation-requests/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [CancellationRequest]
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
router.delete('/:id', CancellationRequestController.deleteCancellationRequest);

export default router;
