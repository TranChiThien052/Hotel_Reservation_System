import express from 'express';
import BookingController from '../controllers/bookingController';

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get data
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', BookingController.getAllBookings);
/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Booking]
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
router.get('/:id', BookingController.getBookingById);
/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create new record
 *     tags: [Booking]
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
router.post('/', BookingController.createBooking);
/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Booking]
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
router.put('/:id', BookingController.updateBooking);
/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Booking]
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
router.delete('/:id', BookingController.deleteBooking);

export default router;
