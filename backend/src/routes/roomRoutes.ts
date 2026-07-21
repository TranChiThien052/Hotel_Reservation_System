import express from 'express';
import RoomController from '../controllers/roomController';
import { authorize } from '../middlewares/authorizer';

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
router.get('/branch/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => RoomController.getRoomsByBranchId(req, res))
});

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
router.get('/', (req, res) => {
    authorize(req, res, ["admin"], () => RoomController.getAllRooms(req, res))
});

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
router.get('/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => RoomController.getRoomById(req, res))
});

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
router.post('/', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomController.createRoom(req, res))
});

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
router.put('/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => RoomController.updateRoom(req, res))
});

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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomController.deleteRoom(req, res))
});

export default router;