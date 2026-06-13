import BookingService from '../services/bookingServices.ts';

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

    async createBooking(req, res) {
        const { booking_code, branch_id, customer_id, room_type_id, assigned_room_id, booking_type, status, checkin_at, checkout_at, num_guests, room_price_snapshot, subtotal, discount_id, discount_amount, total_amount, deposit_amount, created_by, notes } = req.body;
        const data = { booking_code, branch_id, customer_id, room_type_id, assigned_room_id, booking_type, status, checkin_at, checkout_at, num_guests, room_price_snapshot, subtotal, discount_id, discount_amount, total_amount, deposit_amount, created_by, notes };
        return await BookingService.createBooking(data)
        .then(booking => res.status(201).json(booking))
        .catch(error => {
            if (error.code !== 500) {
                return res.status(parseInt(error.code)).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };

    async updateBooking(req, res) {
        const { id } = req.params;
        const { booking_code, assigned_room_id, status, actual_checkin_at, actual_checkout_at, num_guests, discount_id, discount_amount, total_amount, deposit_amount, notes } = req.body;
        const data = { booking_code, assigned_room_id, status, actual_checkin_at, actual_checkout_at, num_guests, discount_id, discount_amount, total_amount, deposit_amount, notes };
        return await BookingService.updateBooking(id, data)
        .then(booking => res.status(200).json(booking))
        .catch(error => {
            if (error.code !== 500) {
                return res.status(parseInt(error.code)).json({ error: error.message });
            }
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
