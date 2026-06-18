import InvoiceFineService from '../services/invoiceFineServices';

class InvoiceFineController {
    async getAllInvoiceFines(req, res) {
        return await InvoiceFineService.getAllInvoiceFines()
            .then(fines => res.status(200).json(fines))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getInvoiceFinesByInvoiceId(req, res) {
        const { id } = req.params;
        return await InvoiceFineService.getInvoiceFinesByInvoiceId(id)
            .then(fines => res.status(200).json(fines))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    }

    async getInvoiceFineById(req, res) {
        const { id } = req.params;
        return await InvoiceFineService.getInvoiceFineById(id)
            .then(fine => {
                if (!fine) {
                    return res.status(404).json({ error: "Invoice fine not found" });
                }
                res.status(200).json(fine);
            })
            .catch(error => {
                if (typeof parseInt(error.code) === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async createInvoiceFine(req, res) {
        const { invoice_id, fine_item_id, description, amount, added_by } = req.body;
        const data = { invoice_id, fine_item_id, description, amount, added_by };
        return await InvoiceFineService.createInvoiceFine(data)
            .then(fine => res.status(201).json(fine))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateInvoiceFine(req, res) {
        const { id } = req.params;
        const { fine_item_id, description, amount, added_by } = req.body;
        const data = { fine_item_id, description, amount, added_by };
        return await InvoiceFineService.updateInvoiceFine(id, data)
            .then(fine => res.status(200).json(fine))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error_code: error.code, error: error.message });
            });
    };

    async deleteInvoiceFine(req, res) {
        const { id } = req.params;
        return await InvoiceFineService.deleteInvoiceFine(id)
            .then(fine => res.status(200).json(fine))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new InvoiceFineController();
