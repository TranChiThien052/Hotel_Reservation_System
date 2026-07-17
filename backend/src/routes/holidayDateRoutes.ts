import express from 'express';
import HolidayDateController from '../controllers/holidayDateController';
import { authorize } from '../middlewares/authorizer';

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
router.get('/', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => HolidayDateController.getAllHolidayDates(req, res))
});
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
router.get('/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => HolidayDateController.getHolidayDateById(req, res))
});
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
router.post('/', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => HolidayDateController.createHolidayDate(req, res))
});
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
router.put('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => HolidayDateController.updateHolidayDate(req, res))
});
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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => HolidayDateController.deleteHolidayDate(req, res))
});

export default router;
