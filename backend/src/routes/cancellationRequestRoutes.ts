import express from 'express';
import CancellationRequestController from '../controllers/cancellationRequestController';
import { authorize } from '../middlewares/authorizer';

const router = express.Router();

/**
 * @swagger
* /cancellation-requests/branch/{id}:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: 
 *                      type: string
 *                   booking_id: 
 *                      type: string 
 *                   requested_by: 
 *                      type: string 
 *                   reason: 
 *                      type: string 
 *                   status: 
 *                      type: string
 *                   refund_amount: 
 *                      type: number
 *                   notes: 
 *                      type: string
 *                   created_at: 
 *                      type: string 
 *                   updated_at: 
 *                      type: string 
 *                   bookings:
 *                     type: object
 *                     properties: 
 *                          id: 
 *                             type: string
 *                          booking_number: 
 *                             type: string 
 *                          customer_name: 
 *                             type: string 
 *                          room_type: 
 *                             type: string 
 *                          payment_status: 
 *                             type: string
 *                          total_amount: 
 *                             type: number
 *                          booked_at: 
 *                             type: string 
 *                          updated_at: 
 *                             type: string
 */
router.get('/branch/:id', CancellationRequestController.getCancellationRequestsByBranchId)

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
