import BookingServiceService from '../services/bookingServiceServices';

class BookingServiceController {
    async getAllBookingServices(req, res) {
        return await BookingServiceService.getAllBookingServices()
            .then(bookingServices => res.status(200).json(bookingServices))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getBookingServicesByBookingId(req, res) {
        const { id } = req.params;
        return await BookingServiceService.getBookingServicesByBookingId(id)
            .then(bookingServices => res.status(200).json(bookingServices))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async getBookingServiceById(req, res) {
        const { id } = req.params;
        return await BookingServiceService.getBookingServiceById(id)
            .then(bookingService => {
                if (!bookingService) {
                    return res.status(404).json({ error: 'Booking Service not found' });
                }
                res.status(200).json(bookingService);
            })
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async createBookingService(req, res) {
        const { booking_id, service_id, quantity, unit_price, total_amount, added_by } = req.body;
        const data = { booking_id, service_id, quantity, unit_price, total_amount, added_by, log_account_id: req.user?.account_id };
        return await BookingServiceService.createBookingService(data)
            .then(bookingService => res.status(201).json(bookingService))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateBookingService(req, res) {
        const { id } = req.params;
        const { quantity, unit_price, total_amount, added_by } = req.body;
        const data = { quantity, unit_price, total_amount, added_by, log_account_id: req.user?.account_id };
        return await BookingServiceService.updateBookingService(id, data)
            .then(bookingService => res.status(200).json(bookingService))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteBookingService(req, res) {
        const { id } = req.params;
        return await BookingServiceService.deleteBookingService(id)
            .then(bookingService => res.status(200).json(bookingService))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new BookingServiceController();
