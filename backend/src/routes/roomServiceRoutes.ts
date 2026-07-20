import express from 'express';
import RoomServiceController from '../controllers/roomServiceController';
import { authorize } from '../middlewares/authorizer';

const router = express.Router();


/**
 * @swagger
 * /services/branch/{id}:
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
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal Server Error
 */
router.get('/branch/:id', RoomServiceController.getServiceByBranchId);

/**
 * @swagger
 * /services:
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
 * /services/{id}:
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
 * /services:
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
router.post('/', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomServiceController.createService(req, res))
});

/**
 * @swagger
 * /services/{id}:
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
router.put('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomServiceController.updateService(req, res))
});

/**
 * @swagger
 * /services/{id}:
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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => RoomServiceController.deleteService(req, res))
});

export default router;