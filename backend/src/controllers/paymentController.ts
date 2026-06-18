import PaymentService from '../services/paymentServices';

class PaymentController {
    async getAllPayments(req, res) {
        return await PaymentService.getAllPayments()
            .then(payments => res.status(200).json(payments))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getPaymentById(req, res) {
        const { id } = req.params;
        return await PaymentService.getPaymentById(id)
            .then(payment => {
                if (!payment) {
                    return res.status(404).json({ error: "Payment not found" });
                }
                res.status(200).json(payment);
            })
            .catch(error => {
                if (typeof parseInt(error.code) === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message })
            });
    };

    async getPaymentsByBookingId(req, res) {
        const { id } = req.params;
        return await PaymentService.getPaymentsByBookingId(id)
            .then(payments => res.status(200).json(payments))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async getPaymentsByInvoiceId(req, res) {
        const { id } = req.params;
        return await PaymentService.getPaymentsByInvoiceId(id)
            .then(payments => res.status(200).json(payments))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async createPayment(req, res) {
        const { booking_id, invoice_id, payment_method, status, amount, is_deposit, transaction_ref, processed_by, notes } = req.body;
        const data = { booking_id, invoice_id, payment_method, status, amount, is_deposit, transaction_ref, processed_by, notes };
        return await PaymentService.createPayment(data)
            .then(payment => res.status(201).json(payment))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updatePayment(req, res) {
        const { id } = req.params;
        const { payment_method, status, amount, is_deposit, transaction_ref, paid_at, processed_by, notes, updated_at } = req.body;
        const data = { payment_method, status, amount, is_deposit, transaction_ref, paid_at, processed_by, notes, updated_at };
        return await PaymentService.updatePayment(id, data)
            .then(payment => res.status(200).json(payment))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deletePayment(req, res) {
        const { id } = req.params;
        return await PaymentService.deletePayment(id)
            .then(payment => res.status(200).json(payment))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new PaymentController();
