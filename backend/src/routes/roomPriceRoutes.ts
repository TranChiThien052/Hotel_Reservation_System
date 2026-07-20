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
router.get('/room-type/:id', RoomPriceController.getRoomPricesByRoomTypeId);

/**
 * @swagger
 * /room-prices/branch/{id}:
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
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     id: 
 *                        type: string
 *                        description: The id parameter
 *                     price_per_day: 
 *                        type: number
 *                        description: The price_per_day parameter
 *                     price_per_hour: 
 *                        type: number
 *                        description: The price_per_hour parameter
 *                     weekend_rate: 
 *                        type: number
 *                        description: The weekend_rate parameter
 *                     holiday_rate: 
 *                        type: number
 *                        description: The holiday_rate parameter
 *                     effective_from: 
 *                        type: string
 *                        description: The effective_from parameter
 *                     effective_to: 
 *                        type: string
 *                        description: The effective_to parameter
 *                     room_types: 
 *                        type: object
 *                        properties:
 *                           id: 
 *                              type: string
 *                              description: The id parameter
 *                           name: 
 *                              type: string
 *                              description: The name parameter
 */
router.get('/branch/:id', RoomPriceController.getRoomPriceByBranchId);

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
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => RoomPriceController.getAllRoomPrices(req, res))
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
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => RoomPriceController.getRoomPriceById(req, res))
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