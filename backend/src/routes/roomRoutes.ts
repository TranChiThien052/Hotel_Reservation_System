import express from 'express';
import RoomController from '../controllers/roomController';

const router = express.Router();

/**
 * @swagger
 * /rooms/branch/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Room]
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
router.get('/branch/:id', RoomController.getRoomsByBranchId);

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get data
 *     tags: [Room]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', RoomController.getAllRooms);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Room]
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
router.get('/:id', RoomController.getRoomById);

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create new record
 *     tags: [Room]
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
router.post('/', RoomController.createRoom);

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Room]
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
router.put('/:id', RoomController.updateRoom);

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Room]
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
router.delete('/:id', RoomController.deleteRoom);

export default router;