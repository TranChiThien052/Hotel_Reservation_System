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

    async getTodayCheckin(req, res) {
        const { id } = req.params;
        return await BookingService.getTodayCheckinCount(id)
            .then(response => {
                res.status(200).json({ bookings: response, count: response.length })
            })
            .catch(error => {
                if (typeof parseInt(error.code) === 'number')
                    return res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error: error.message })
            });
    }

    async createBooking(req, res) {
        const { branch_id, customer_id, room_type_id, booking_type, status, checkin_at, checkout_at, num_guests, discount_id, created_by, notes } = req.body;
        const data = { branch_id, customer_id, room_type_id, booking_type, status, checkin_at, checkout_at, num_guests, discount_id, created_by, notes };
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
        const { room_type_id, assigned_room_id, status, checkin_at, checkout_at, actual_checkin_at, actual_checkout_at, num_guests, discount_id, deposit_amount, deposit_paid_at, expires_at, notes } = req.body;
        const data = { room_type_id, assigned_room_id, status, checkin_at, checkout_at, actual_checkin_at, actual_checkout_at, num_guests, discount_id, deposit_amount, deposit_paid_at, expires_at, notes };
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
