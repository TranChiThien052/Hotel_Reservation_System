import HistoryTransactionService from '../services/historyTransactionServices.ts';

class HistoryTransactionController {
    async getAllTransactions(req, res) {
        return await HistoryTransactionService.getAllTransactions()
        .then(transactions => res.status(200).json(transactions))
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async getTransactionById(req, res) {
        const { id } = req.params;
        return await HistoryTransactionService.getTransactionById(id)
        .then(transaction => {
            if (!transaction) {
                return res.status(404).json({ error: "Transaction not found" });
            }
            res.status(200).json(transaction);
        })
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async createTransaction(req, res) {
        const { account_id, action, target_type, target_id, description, metadata } = req.body;
        const data = { account_id, action, target_type, target_id, description, metadata };
        return await HistoryTransactionService.createTransaction(data)
        .then(transaction => res.status(201).json(transaction))
        .catch(error => {
            if (error.code !== 500) {
                return res.status(parseInt(error.code)).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };

    async deleteTransaction(req, res) {
        const { id } = req.params;
        return await HistoryTransactionService.deleteTransaction(id)
        .then(transaction => res.status(200).json(transaction))
        .catch(error => {
            if (error.code === "P2025") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };
}

export default new HistoryTransactionController();
