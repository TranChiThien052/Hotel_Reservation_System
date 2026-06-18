import express from 'express';
import BookingServiceController from '../controllers/bookingServiceController';

const router = express.Router();

router.get('/bookings/:id', BookingServiceController.getBookingServicesByBookingId);
router.get('/', BookingServiceController.getAllBookingServices);
router.get('/:id', BookingServiceController.getBookingServiceById);
router.post('/', BookingServiceController.createBookingService);
router.put('/:id', BookingServiceController.updateBookingService);
router.delete('/:id', BookingServiceController.deleteBookingService);

export default router;
