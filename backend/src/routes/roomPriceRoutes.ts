import express from 'express';
import RoomPriceController from '../controllers/roomPriceController';
import { authorize } from '../middlewares/authorizer';

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
router.get('/room-type/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomPriceController.getRoomPricesByRoomTypeId(req, res))
});

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
router.get('/', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => RoomPriceController.getAllRoomPrices(req, res))
});

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
router.get('/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => RoomPriceController.getRoomPriceById(req, res))
});

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
router.post('/', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomPriceController.createRoomPrice(req, res))
});

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
router.put('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomPriceController.updateRoomPrice(req, res))
});

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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomPriceController.deleteRoomPrice(req, res))
});

export default router;