import CancellationRequestService from '../services/cancellationRequestServices.ts';

class CancellationRequestController {
    async getAllCancellationRequests(req, res) {
        return await CancellationRequestService.getAllCancellationRequests()
        .then(requests => res.status(200).json(requests))
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async getCancellationRequestById(req, res) {
        const { id } = req.params;
        return await CancellationRequestService.getCancellationRequestById(id)
        .then(request => {
            if (!request) {
                return res.status(404).json({ error: "Cancellation request not found" });
            }
            res.status(200).json(request);
        })
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async createCancellationRequest(req, res) {
        const { booking_id, requested_by, reason, status, refund_amount, notes } = req.body;
        const data = { booking_id, requested_by, reason, status, refund_amount, notes };
        return await CancellationRequestService.createCancellationRequest(data)
        .then(request => res.status(201).json(request))
        .catch(error => {
            if (error.code !== 500) {
                return res.status(parseInt(error.code)).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };

    async updateCancellationRequest(req, res) {
        const { id } = req.params;
        const { reason, status, refund_amount, refund_processed_at, resolved_by, notes } = req.body;
        const data = { reason, status, refund_amount, refund_processed_at, resolved_by, notes };
        return await CancellationRequestService.updateCancellationRequest(id, data)
        .then(request => res.status(200).json(request))
        .catch(error => {
            if (error.code !== 500) {
                return res.status(parseInt(error.code)).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };

    async deleteCancellationRequest(req, res) {
        const { id } = req.params;
        return await CancellationRequestService.deleteCancellationRequest(id)
        .then(request => res.status(200).json(request))
        .catch(error => {
            if (error.code === "P2025") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };
}

export default new CancellationRequestController();
