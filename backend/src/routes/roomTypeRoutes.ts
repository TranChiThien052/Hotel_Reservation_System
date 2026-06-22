import express from 'express';
import RoomTypeController from '../controllers/roomTypeController';

const router = express.Router();

/**
 * @swagger
 * /room-types/branch/{id}:
 *   get:
 *     summary: Get data
 *     tags: [RoomType]
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

router.get('/branch/:id', RoomTypeController.getRoomTypesByBranchId);

/**
 * @swagger
 * /room-types:
 *   get:
 *     summary: Get data
 *     tags: [RoomType]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', RoomTypeController.getAllRoomTypes);

/**
 * @swagger
 * /room-types/{id}:
 *   get:
 *     summary: Get data
 *     tags: [RoomType]
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
router.get('/:id', RoomTypeController.getRoomTypeById);

/**
 * @swagger
 * /room-types:
 *   post:
 *     summary: Create new record
 *     tags: [RoomType]
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
router.post('/', RoomTypeController.createRoomType);

/**
 * @swagger
 * /room-types/{id}:
 *   put:
 *     summary: Update record
 *     tags: [RoomType]
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
router.put('/:id', RoomTypeController.updateRoomType);

/**
 * @swagger
 * /room-types/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [RoomType]
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
router.delete('/:id', RoomTypeController.deleteRoomType);

export default router;