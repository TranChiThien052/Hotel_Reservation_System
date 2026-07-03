import express from 'express';
import RoomTypeController from '../controllers/roomTypeController';
import { upload } from '../middlewares/uploader';

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
 * /room-types/images/{id}:
 *   post:
 *     summary: Add room type image
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files
 *     responses:
 *       201:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */

router.post('/images/id', upload.array("images", 5), RoomTypeController.addRoomTypeImage);

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
router.post('/', upload.array("images", 5), RoomTypeController.createRoomType);

/**
 * @swagger
 * /room-types/images:
 *   delete:
 *     summary: Delete image
 *     tags: [RoomType]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               img_url:
 *                 type: string
 *               public_id:
 *                 type: string 
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.delete('/images', RoomTypeController.deleteRoomTypeImage);

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

export default router;