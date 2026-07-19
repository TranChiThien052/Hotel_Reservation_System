import express from 'express';
import BookingServiceController from '../controllers/bookingServiceController';
import { authorize } from '../middlewares/authorizer';

const router = express.Router();

/**
 * @swagger
 * /booking-services/bookings/{id}:
 *   get:
 *     summary: Get data
 *     tags: [BookingService]
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
router.get('/bookings/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => BookingServiceController.getBookingServicesByBookingId(req, res))
});
/**
 * @swagger
 * /booking-services:
 *   get:
 *     summary: Get data
 *     tags: [BookingService]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => BookingServiceController.getAllBookingServices(req, res))
});
/**
 * @swagger
 * /booking-services/{id}:
 *   get:
 *     summary: Get data
 *     tags: [BookingService]
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
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => BookingServiceController.getBookingServiceById(req, res))
});
/**
 * @swagger
 * /booking-services:
 *   post:
 *     summary: Create new record
 *     tags: [BookingService]
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
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => BookingServiceController.createBookingService(req, res))
});
/**
 * @swagger
 * /booking-services/{id}:
 *   put:
 *     summary: Update record
 *     tags: [BookingService]
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
    authorize(req, res, ["staff", "manager", "admin"], () => BookingServiceController.updateBookingService(req, res))
});
/**
 * @swagger
 * /booking-services/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [BookingService]
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
    authorize(req, res, ["staff", "manager", "admin"], () => BookingServiceController.deleteBookingService(req, res))
});

export default router;
