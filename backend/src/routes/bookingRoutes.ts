import express from 'express';
import BookingController from '../controllers/bookingController';
import { authorize } from '../middlewares/authorizer';

const router = express.Router();

/**
 * @swagger
 * /bookings/calculate-price:
 *   post:
 *     summary: Calculate booking price
 *     tags: [Booking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               room_type_id:
 *                 type: string
 *                 description: Room type id
 *               checkin_at:
 *                 type: string
 *                 description: Checkin at
 *               checkout_at:
 *                 type: string
 *                 description: Checkout at
 *               booking_type:
 *                 type: string
 *                 description: Booking type
 *               branch_id:
 *                 type: string
 *                 description: Branch id
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     price:
 *                        type: number
 */
router.post('/calculate-price', BookingController.calculateBookingPrice);
/**
 * @swagger
 * /bookings/customer/{id}:
 *   get:
 *     summary: Get data by customer id
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
 *         content:
 *            application/json:
 *               schema:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                        id:
 *                           type: string
 *                        booking_code:
 *                           type: string
 *                        branch_id:
 *                           type: string
 *                        customer_id:
 *                           type: string
 *                        room_type_id:
 *                           type: string
 *                        assigned_room_id:
 *                           type: string
 *                        booking_type:
 *                           type: string
 *                        status:
 *                           type: string
 *                        checkin_at:
 *                           type: string
 *                        checkout_at:
 *                           type: string
 *                        actual_checkin_at:
 *                           type: string
 *                        actual_checkout_at:
 *                           type: string
 *                        num_guests:
 *                           type: string
 *                        room_price_snapshot:
 *                           type: string
 *                        discount_id:
 *                           type: string
 *                        discount_amount:
 *                           type: string
 *                        subtotal:
 *                           type: string
 *                        total_amount:
 *                           type: string
 *                        deposit_amount:
 *                           type: string
 *                        deposit_paid_at:
 *                           type: string
 *                        expires_at:
 *                           type: string
 *                        created_by:
 *                           type: string
 *                        notes:
 *                           type: string
 *                        created_at:
 *                           type: string
 *                        updated_at:
 *                           type: string
 *       500:
 *         description: Internal server error
 */
router.get('/customer/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => BookingController.getBookingByCustomerId(req, res))
});

/**
 * @swagger
 * /bookings/branch/{id}:
 *   get:
 *     summary: Get data by branch id
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
 *         content:
 *            application/json:
 *               schema:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                        id:
 *                           type: string
 *                        booking_code:
 *                           type: string
 *                        branch_id:
 *                           type: string
 *                        customer_id:
 *                           type: string
 *                        room_type_id:
 *                           type: string
 *                        assigned_room_id:
 *                           type: string
 *                        booking_type:
 *                           type: string
 *                        status:
 *                           type: string
 *                        checkin_at:
 *                           type: string
 *                        checkout_at:
 *                           type: string
 *                        actual_checkin_at:
 *                           type: string
 *                        actual_checkout_at:
 *                           type: string
 *                        num_guests:
 *                           type: string
 *                        room_price_snapshot:
 *                           type: string
 *                        discount_id:
 *                           type: string
 *                        discount_amount:
 *                           type: string
 *                        subtotal:
 *                           type: string
 *                        total_amount:
 *                           type: string
 *                        deposit_amount:
 *                           type: string
 *                        deposit_paid_at:
 *                           type: string
 *                        expires_at:
 *                           type: string
 *                        created_by:
 *                           type: string
 *                        notes:
 *                           type: string
 *                        created_at:
 *                           type: string
 *                        updated_at:
 *                           type: string
 *       500:
 *         description: Internal server error
 */
router.get('/branch/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => BookingController.getBookingByBranchId(req, res))
});

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get data
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: array
 *                  items:
 *                     type: object
 *                     properties:
 *                        id:
 *                           type: string
 *                        booking_code:
 *                           type: string
 *                        branch_id:
 *                           type: string
 *                        customer_id:
 *                           type: string
 *                        room_type_id:
 *                           type: string
 *                        assigned_room_id:
 *                           type: string
 *                        booking_type:
 *                           type: string
 *                        status:
 *                           type: string
 *                        checkin_at:
 *                           type: string
 *                        checkout_at:
 *                           type: string
 *                        actual_checkin_at:
 *                           type: string
 *                        actual_checkout_at:
 *                           type: string
 *                        num_guests:
 *                           type: string
 *                        room_price_snapshot:
 *                           type: string
 *                        discount_id:
 *                           type: string
 *                        discount_amount:
 *                           type: string
 *                        subtotal:
 *                           type: string
 *                        total_amount:
 *                           type: string
 *                        deposit_amount:
 *                           type: string
 *                        deposit_paid_at:
 *                           type: string
 *                        expires_at:
 *                           type: string
 *                        created_by:
 *                           type: string
 *                        notes:
 *                           type: string
 *                        created_at:
 *                           type: string
 *                        updated_at:
 *                           type: string
 *       500:
 *         description: Internal server error
 */
router.get('/', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => BookingController.getAllBookings(req, res))
});
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
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     id:
 *                        type: string
 *                     booking_code:
 *                        type: string
 *                     branch_id:
 *                        type: string
 *                     customer_id:
 *                        type: string
 *                     room_type_id:
 *                        type: string
 *                     assigned_room_id:
 *                        type: string
 *                     booking_type:
 *                        type: string
 *                     status:
 *                        type: string
 *                     checkin_at:
 *                        type: string
 *                     checkout_at:
 *                        type: string
 *                     actual_checkin_at:
 *                        type: string
 *                     actual_checkout_at:
 *                        type: string
 *                     num_guests:
 *                        type: string
 *                     room_price_snapshot:
 *                        type: string
 *                     discount_id:
 *                        type: string
 *                     discount_amount:
 *                        type: string
 *                     subtotal:
 *                        type: string
 *                     total_amount:
 *                        type: string
 *                     deposit_amount:
 *                        type: string
 *                     deposit_paid_at:
 *                        type: string
 *                     expires_at:
 *                        type: string
 *                     created_by:
 *                        type: string
 *                     notes:
 *                        type: string
 *                     created_at:
 *                        type: string
 *                     updated_at:
 *                        type: string
 *                     payments:
 *                        type: array
 *                        items:
 *                           type: object
 *                           properties:
 *                              amount:
 *                                 type: string
 *                              paid_at:
 *                                 type: string
 *                              is_deposit:
 *                                 type: boolean
 *                              transaction_ref:
 *                                 type: string
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => BookingController.getBookingById(req, res))
});
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
 *             properties:
 *                branch_id:
 *                   type: string
 *                   required: true
 *                customer_id:
 *                   type: string
 *                   required: true
 *                room_type_id:
 *                   type: string
 *                   required: true
 *                booking_type:
 *                   type: string
 *                   required: true
 *                status:
 *                   type: string
 *                   example: pending/confirmed/checked-in/checked-out/completed/cancelled
 *                   required: false
 *                checkin_at:
 *                   type: string
 *                   format: date
 *                   required: true
 *                checkout_at:
 *                   type: string
 *                   format: date
 *                   required: true
 *                num_guests:
 *                   type: integer
 *                   required: true
 *                discount_id:
 *                   type: string
 *                   required: false
 *                created_by:
 *                   type: string
 *                   required: false
 *                notes:
 *                   type: string
 *                   required: false
 *     responses:
 *       201:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     id:
 *                        type: string
 *                     booking_code:
 *                        type: string
 *                     branch_id:
 *                        type: string
 *                     customer_id:
 *                        type: string
 *                     room_type_id:
 *                        type: string
 *                     assigned_room_id:
 *                        type: string
 *                     booking_type:
 *                        type: string
 *                     status:
 *                        type: string
 *                     checkin_at:
 *                        type: string
 *                        format: date
 *                     checkout_at:
 *                        type: string
 *                        format: date
 *                     actual_checkin_at:
 *                        type: string
 *                        format: date
 *                     actual_checkout_at:
 *                        type: string
 *                        format: date
 *                     num_guests:
 *                        type: integer
 *                     room_price_snapshot:
 *                        type: number
 *                        format: double
 *                     discount_id:
 *                        type: string
 *                     discount_amount:
 *                        type: number
 *                        format: double
 *                     subtotal:
 *                        type: number
 *                        format: double
 *                     total_amount:
 *                        type: number
 *                        format: double
 *                     deposit_amount:
 *                        type: number
 *                        format: double
 *                     deposit_paid_at:
 *                        type: string
 *                        format: date
 *                     created_by:
 *                        type: string
 *                     notes:
 *                        type: string
 *                     created_at:
 *                        type: string
 *                        format: date
 *                     updated_at:
 *                        type: string
 *                        format: date
 *       400:
 *         description: Bad request
 *       404:
 *         description: Data not found
 *       500:
 *         description: Internal server error
 */
router.post('/', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => BookingController.createBooking(req, res))
});
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                room_type_id:
 *                   type: string
 *                   required: false
 *                   format: uuid
 *                assigned_room_id:
 *                   type: string
 *                   required: false
 *                   format: uuid
 *                status:
 *                   type: string
 *                   required: false
 *                checkin_at:
 *                   type: string
 *                   required: false
 *                   format: date-time
 *                checkout_at:
 *                   type: string
 *                   required: false
 *                   format: date-time
 *                actual_checkin_at:
 *                   type: string
 *                   format: date-time
 *                actual_checkout_at:
 *                   type: string
 *                   format: date-time
 *                num_guests:
 *                   type: integer
 *                   required: false
 *                discount_id:
 *                   type: string
 *                   required: false
 *                   format: uuid
 *                discount_amount:
 *                   type: number
 *                   required: false
 *                   format: double
 *                discount_paid_at:
 *                   type: string
 *                   format: date-time
 *                notes:
 *                   type: string
 *                   required: false
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     id:
 *                        type: string
 *                        required: true
 *                        format: uuid
 *                     booking_code:
 *                        type: string
 *                        required: false
 *                        example: BOOK-001
 *                     branch_id:
 *                        type: string
 *                        required: false
 *                        format: uuid
 *                     customer_id:
 *                        type: string
 *                        required: false
 *                        format: uuid
 *                     room_type_id:
 *                        type: string
 *                        required: false
 *                        format: uuid
 *                     assigned_room_id:
 *                        type: string
 *                        required: false
 *                        format: uuid
 *                     booking_type:
 *                        type: string
 *                        required: false
 *                     status:
 *                        type: string
 *                        required: false
 *                     checkin_at:
 *                        type: string
 *                        required: false
 *                        format: date-time
 *                     checkout_at:
 *                        type: string
 *                        required: false
 *                        format: date-time
 *                     num_guests:
 *                        type: integer
 *                        required: false
 *                     room_price_snapshot:
 *                        type: number
 *                        required: false
 *                        format: double
 *                     discount_id:
 *                        type: string
 *                        required: false
 *                        format: uuid
 *                     discount_amount:
 *                        type: number
 *                        required: false
 *                        format: double
 *                     subtotal:
 *                        type: number
 *                        required: false
 *                        format: double
 *                     total_amount:
 *                        type: number
 *                        required: false
 *                        format: double
 *                     deposit_amount:
 *                        type: number
 *                        required: false
 *                        format: double
 *                     deposit_paid_at:
 *                        type: string
 *                        required: false
 *                        format: date-time
 *                     created_by:
 *                        type: string
 *                        required: false
 *                        format: uuid
 *                     notes:
 *                        type: string
 *                        required: false
 *                     created_at:
 *                        type: string
 *                        required: false
 *                        format: date-time
 *                     updated_at:
 *                        type: string
 *                        required: false
 *                        format: date-time
 *       400:
 *         description: Bad request
 *       404:
 *         description: Data not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => BookingController.updateBooking(req, res))
});
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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["admin"], () => BookingController.deleteBooking(req, res))
});
/**
 * @swagger
 * /bookings/today/{branch_id}:
 *    get:
 *       summary: Get today checkin count
 *       tags: [Booking]
 *       parameters:
 *          - in: path
 *            name: branch_id
 *            required: true
 *            schema:
 *               type: string
 *            description: The branch id parameter
 *       responses:
 *          200:
 *             description: Successful operation
 *             content:
 *                application/json:
 *                   schema:
 *                      type: object
 *                      properties:
 *                         checkins:
 *                            type: array
 *                            items:
 *                               type: object
 *                               properties:
 *                                  id:
 *                                     type: string
 *                                     required: true
 *                                     format: uuid
 *                                  booking_code:
 *                                     type: string
 *                                     required: false
 *                                     example: BOOK-001
 *                                  branch_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  customer_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  room_type_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  assigned_room_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  booking_type:
 *                                     type: string
 *                                     required: false
 *                                  status:
 *                                     type: string
 *                                     required: false
 *                                  checkin_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                                  checkout_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                                  num_guests:
 *                                     type: integer
 *                                     required: false
 *                                  room_price_snapshot:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  discount_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  discount_amount:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  subtotal:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  total_amount:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  deposit_amount:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  deposit_paid_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                                  created_by:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  notes:
 *                                     type: string
 *                                     required: false
 *                                  created_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                                  updated_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                         checkouts:
 *                            type: array
 *                            items:
 *                               type: object
 *                               properties:
 *                                  id:
 *                                     type: string
 *                                     required: true
 *                                     format: uuid
 *                                  booking_code:
 *                                     type: string
 *                                     required: false
 *                                     example: BOOK-001
 *                                  branch_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  customer_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  room_type_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  assigned_room_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  booking_type:
 *                                     type: string
 *                                     required: false
 *                                  status:
 *                                     type: string
 *                                     required: false
 *                                  checkin_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                                  checkout_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                                  num_guests:
 *                                     type: integer
 *                                     required: false
 *                                  room_price_snapshot:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  discount_id:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  discount_amount:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  subtotal:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  total_amount:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  deposit_amount:
 *                                     type: number
 *                                     required: false
 *                                     format: double
 *                                  deposit_paid_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                                  created_by:
 *                                     type: string
 *                                     required: false
 *                                     format: uuid
 *                                  notes:
 *                                     type: string
 *                                     required: false
 *                                  created_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                                  updated_at:
 *                                     type: string
 *                                     required: false
 *                                     format: date-time
 *                         checkinsCount:
 *                            type: integer
 *                         checkoutsCount:
 *                            type: integer
 *          400:
 *             description: Bad request
 *          404:
 *             description: Data not found
 *          500:
 *             description: Internal server error
 */
router.get('/today/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => BookingController.getTodayCheckin(req, res))
});
export default router;
