import express from 'express';
import StaffController from '../controllers/staffController';


const router = express.Router();

/**
 * @swagger
 * /staffs:
 *   get:
 *     summary: Get data
 *     tags: [Staff]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', StaffController.getAllStaff);
/**
 * @swagger
 * /staffs/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Staff]
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
router.get('/:id', StaffController.getStaffById);
/**
 * @swagger
 * /staffs:
 *   post:
 *     summary: Create new record
 *     tags: [Staff]
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
router.post('/', StaffController.createStaff);
/**
 * @swagger
 * /staffs/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Staff]
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
router.put('/:id', StaffController.updateStaff);
/**
 * @swagger
 * /staffs/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Staff]
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
router.delete('/:id', StaffController.deleteStaff);

export default router;
