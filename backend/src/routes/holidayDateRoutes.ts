import express from 'express';
import HolidayDateController from '../controllers/holidayDateController';

const router = express.Router();

/**
 * @swagger
 * /holiday-dates:
 *   get:
 *     summary: Get data
 *     tags: [HolidayDate]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', HolidayDateController.getAllHolidayDates);
/**
 * @swagger
 * /holiday-dates/{id}:
 *   get:
 *     summary: Get data
 *     tags: [HolidayDate]
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
router.get('/:id', HolidayDateController.getHolidayDateById);
/**
 * @swagger
 * /holiday-dates:
 *   post:
 *     summary: Create new record
 *     tags: [HolidayDate]
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
router.post('/', HolidayDateController.createHolidayDate);
/**
 * @swagger
 * /holiday-dates/{id}:
 *   put:
 *     summary: Update record
 *     tags: [HolidayDate]
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
router.put('/:id', HolidayDateController.updateHolidayDate);
/**
 * @swagger
 * /holiday-dates/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [HolidayDate]
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
router.delete('/:id', HolidayDateController.deleteHolidayDate);

export default router;
