import express from 'express';
import BookingServiceController from '../controllers/bookingServiceController';

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
router.get('/bookings/:id', BookingServiceController.getBookingServicesByBookingId);
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
router.get('/', BookingServiceController.getAllBookingServices);
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
router.get('/:id', BookingServiceController.getBookingServiceById);
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
router.post('/', BookingServiceController.createBookingService);
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
router.put('/:id', BookingServiceController.updateBookingService);
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
router.delete('/:id', BookingServiceController.deleteBookingService);

export default router;
