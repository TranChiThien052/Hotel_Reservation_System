import { Router } from 'express';
import RoomAvailabilityController from '../controllers/roomAvailabilityController';
import { authorize } from '../middlewares/authorizer';

const router = Router();

/**
 * @swagger
 * /rooms-availability/available:
 *   get:
 *     summary: Get available room count
 *     tags: [RoomAvailability]
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *       - in: query
 *         name: checkin
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkin parameter
 *       - in: query
 *         name: checkout
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkout parameter
 *       - in: query
 *         name: room_type_id
 *         required: false
 *         schema:
 *           type: string
 *         description: The room_type_id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */
router.get("/available", (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => RoomAvailabilityController.getAvailableRoomCount(req, res))
});
/**
 * @swagger
 * /rooms-availability/search:
 *   get:
 *     summary: Search available rooms
 *     tags: [RoomAvailability]
 *     parameters:
 *       - in: query
 *         name: branch_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *       - in: query
 *         name: checkin
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkin_at parameter
 *       - in: query
 *         name: checkout
 *         required: true
 *         schema:
 *           type: string
 *         description: The checkout_at parameter
 *       - in: query
 *         name: room_type_id
 *         required: false
 *         schema:
 *           type: string
 *         description: The room_type_id parameter
 *       - in: query
 *         name: num_guests
 *         required: false
 *         schema:
 *           type: number
 *         description: The num_guests parameter
 *       - in: query
 *         name: booking_type
 *         required: false
 *         schema:
 *           type: string
 *         description: The booking_type parameter
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Internal server error
 */
router.get("/search", (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => RoomAvailabilityController.searchAvailableRooms(req, res))
});

export default router;