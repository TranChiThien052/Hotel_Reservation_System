import express from 'express';
import RoomServiceController from '../controllers/roomServiceController';

const router = express.Router();

/**
 * @swagger
 * /room-services:
 *   get:
 *     summary: Get data
 *     tags: [RoomService]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', RoomServiceController.getAllServices);

/**
 * @swagger
 * /room-services/{id}:
 *   get:
 *     summary: Get data
 *     tags: [RoomService]
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
router.get('/:id', RoomServiceController.getServiceById);

/**
 * @swagger
 * /room-services:
 *   post:
 *     summary: Create new record
 *     tags: [RoomService]
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
router.post('/', RoomServiceController.createService);

/**
 * @swagger
 * /room-services/{id}:
 *   put:
 *     summary: Update record
 *     tags: [RoomService]
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
router.put('/:id', RoomServiceController.updateService);

/**
 * @swagger
 * /room-services/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [RoomService]
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
router.delete('/:id', RoomServiceController.deleteService);

export default router;