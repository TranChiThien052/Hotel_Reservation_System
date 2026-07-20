import express from 'express';
import RoomTypeController from '../controllers/roomTypeController';
import { upload } from '../middlewares/uploader';
import { authorize } from '../middlewares/authorizer';

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

router.get('/branch/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => RoomTypeController.getRoomTypesByBranchId(req, res))
});

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
router.get('/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => RoomTypeController.getRoomTypeById(req, res))
});

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

router.post('/images/:id', upload.array("images", 5), (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomTypeController.addRoomTypeImage(req, res))
});

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
router.post('/', upload.array("images", 5), (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomTypeController.createRoomType(req, res))
});

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
router.delete('/images', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomTypeController.deleteRoomTypeImage(req, res))
});

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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomTypeController.deleteRoomType(req, res))
});

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
router.put('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomTypeController.updateRoomType(req, res))
});

export default router;