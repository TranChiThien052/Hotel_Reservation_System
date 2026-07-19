import FineItemService from '../services/fineItemServices';

class FineItemController {
    async getAllFineItems(req, res) {
        return await FineItemService.getAllFineItems()
            .then(items => res.status(200).json(items))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getFineItemById(req, res) {
        const { id } = req.params;
        return await FineItemService.getFineItemById(id)
            .then(item => {
                if (!item) {
                    return res.status(404).json({ error: "Fine item not found" });
                }
                res.status(200).json(item);
            })
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async getFineItemsByBranchId(req, res) {
        const { id } = req.params;
        return await FineItemService.getFineItemsByBranchId(id)
            .then(items => res.status(200).json(items))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    }

    async createFineItem(req, res) {
        const { branch_id, name, description, price } = req.body;
        const data = { branch_id, name, description, price, log_account_id: req.user?.account_id };
        return await FineItemService.createFineItem(data)
            .then(item => res.status(201).json(item))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateFineItem(req, res) {
        const { id } = req.params;
        const { branch_id, name, description, price } = req.body;
        const data = { branch_id, name, description, price, log_account_id: req.user?.account_id };
        return await FineItemService.updateFineItem(id, data)
            .then(item => res.status(200).json(item))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteFineItem(req, res) {
        const { id } = req.params;
        return await FineItemService.deleteFineItem(id)
            .then(item => res.status(200).json(item))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new FineItemController();
