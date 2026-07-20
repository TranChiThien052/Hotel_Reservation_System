import InvoiceService from '../services/invoiceServices';

class InvoiceController {
    async getAllInvoices(req, res) {
        return await InvoiceService.getAllInvoices()
            .then(invoices => res.status(200).json(invoices))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getInvoiceById(req, res) {
        const { id } = req.params;
        return await InvoiceService.getInvoiceById(id)
            .then(invoice => {
                if (!invoice) {
                    return res.status(404).json({ error: "Invoice not found" });
                }
                res.status(200).json(invoice);
            })
            .catch(error => {
                if (typeof parseInt(error.code) === "number") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message })
            });
    };

    async getInvoiceByBookingId(req, res) {
        const { id } = req.params;
        return await InvoiceService.getInvoiceByBookingId(id)
            .then(invoices => res.status(200).json(invoices))
            .catch(error => {
                if (typeof parseInt(error) === "number") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            })
    }

    async calculateInvoice(req, res) {
        const { id } = req.params;
        return await InvoiceService.calculateInvoiceAmount(id)
            .then(invoice => res.status(200).json(invoice))
            .catch(error => {
                if (typeof parseInt(error.code) === "number") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    }

    async createInvoice(req, res) {
        const { booking_id, issued_by, notes } = req.body;
        const data = { booking_id, issued_by, notes, log_account_id: req.user?.account_id };
        return await InvoiceService.createInvoice(data)
            .then(invoice => res.status(201).json(invoice))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateInvoice(req, res) {
        const { id } = req.params;
        const { room_charge, service_charge, fine_charge, late_checkout_fee, early_checkout_fee, discount_amount, total_amount, deposit_used, amount_due, refund_amount, notes } = req.body;
        const data = { room_charge, service_charge, fine_charge, late_checkout_fee, early_checkout_fee, discount_amount, total_amount, deposit_used, amount_due, refund_amount, notes, log_account_id: req.user?.account_id };
        return await InvoiceService.updateInvoice(id, data)
            .then(invoice => res.status(200).json(invoice))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteInvoice(req, res) {
        const { id } = req.params;
        return await InvoiceService.deleteInvoice(id)
            .then(invoice => res.status(200).json(invoice))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new InvoiceController();
