import BookingService from '../services/bookingServices';

class BookingController {
    async getAllBookings(req, res) {
        return await BookingService.getAllBookings()
            .then(bookings => res.status(200).json(bookings))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getBookingById(req, res) {
        const { id } = req.params;
        return await BookingService.getBookingById(id)
            .then(booking => {
                if (!booking) {
                    return res.status(404).json({ error: "Booking not found" });
                }
                res.status(200).json(booking);
            })
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getBookingByBranchId(req, res) {
        const { id } = req.params;
        return await BookingService.getBookingByBranchId(id)
            .then(bookings => res.status(200).json(bookings))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number')
                    return res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error: error });
            })
    }

    async getBookingByCustomerId(req, res) {
        const { id } = req.params;
        return await BookingService.getBookingByCustomerId(id)
            .then(bookings => res.status(200).json(bookings))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number')
                    return res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error: error })
            })
    }

    async calculateBookingPrice(req, res) {
        const { room_type_id, checkin_at, checkout_at, booking_type, branch_id } = req.body;
        return await BookingService.calculateBookingPrice(room_type_id, checkin_at, checkout_at, booking_type, branch_id)
            .then(price => res.status(200).json(price))
            .catch(error => res.status(500).json({ error: error.message }));
    }

    async getTodayCheckin(req, res) {
        const { id } = req.params;
        return await BookingService.getTodayCheckinCount(id)
            .then(response => {
                res.status(200).json({
                    checkins: response.checkins,
                    checkouts: response.checkouts,
                    checkinsCount: response.checkinsCount,
                    checkoutsCount: response.checkoutsCount
                })
            })
            .catch(error => {
                if (typeof parseInt(error.code) === 'number')
                    return res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error: error.message })
            });
    }

    async createBooking(req, res) {
        const { branch_id, customer_id, room_type_id, booking_type, status, checkin_at, checkout_at, num_guests, discount_id, created_by, notes } = req.body;
        const data = { branch_id, customer_id, room_type_id, booking_type, status, checkin_at, checkout_at, num_guests, discount_id, created_by, notes, log_account_id: req.user.account_id };
        return await BookingService.createBooking(data)
            .then(booking => res.status(201).json(booking))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number')
                    return res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error: error.message });
            });
    };

    async updateBooking(req, res) {
        const { id } = req.params;
        const { room_type_id, assigned_room_id, status, checkin_at, checkout_at, actual_checkin_at, actual_checkout_at, num_guests, discount_id, deposit_amount, deposit_paid_at, notes } = req.body;
        const data = { room_type_id, assigned_room_id, status, checkin_at, checkout_at, actual_checkin_at, actual_checkout_at, num_guests, discount_id, deposit_amount, deposit_paid_at, notes, log_account_id: req.user.account_id };
        return await BookingService.updateBooking(id, data)
            .then(booking => res.status(200).json(booking))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number')
                    return res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error: error.message });
            });
    };

    async deleteBooking(req, res) {
        const { id } = req.params;
        return await BookingService.deleteBooking(id)
            .then(booking => res.status(200).json(booking))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new BookingController();
