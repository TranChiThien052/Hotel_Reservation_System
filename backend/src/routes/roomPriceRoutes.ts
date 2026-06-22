import express from 'express';
import RoomPriceController from '../controllers/roomPriceController';

const router = express.Router();

/**
 * @swagger
 * /room-prices/room-type/{id}:
 *   get:
 *     summary: Get data
 *     tags: [RoomPrice]
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
router.get('/room-type/:id', RoomPriceController.getRoomPricesByRoomTypeId);

/**
 * @swagger
 * /room-prices:
 *   get:
 *     summary: Get data
 *     tags: [RoomPrice]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', RoomPriceController.getAllRoomPrices);

/**
 * @swagger
 * /room-prices/{id}:
 *   get:
 *     summary: Get data
 *     tags: [RoomPrice]
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
router.get('/:id', RoomPriceController.getRoomPriceById);

/**
 * @swagger
 * /room-prices:
 *   post:
 *     summary: Create new record
 *     tags: [RoomPrice]
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
router.post('/', RoomPriceController.createRoomPrice);

/**
 * @swagger
 * /room-prices/{id}:
 *   put:
 *     summary: Update record
 *     tags: [RoomPrice]
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
router.put('/:id', RoomPriceController.updateRoomPrice);

/**
 * @swagger
 * /room-prices/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [RoomPrice]
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
router.delete('/:id', RoomPriceController.deleteRoomPrice);

export default router;