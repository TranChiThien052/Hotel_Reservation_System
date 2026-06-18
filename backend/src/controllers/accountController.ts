import AccountService from '../services/accountServices';

class AccountController {
    async getAllAccounts(req, res) {
        return await AccountService.getAllAccounts()
            .then(accounts => res.status(200).json(accounts))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getAccountByUsername(req, res) {
        const { username } = req.params;
        return await AccountService.getAccountByUsername(username)
            .then(account => {
                if (!account) {
                    return res.status(404).json({ error: "Account not found" });
                }
                res.status(200).json(account);
            })
            .catch(error => {
                if (typeof parseInt(error.code) === "number")
                    return res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error: error.message })
            });
    };

    async getAccountById(req, res) {
        const { id } = req.params;
        return await AccountService.getAccountById(id)
            .then(account => {
                if (!account) {
                    return res.status(404).json({ error: "Account not found" });
                }
                res.status(200).json(account);
            })
            .catch(error => {
                if (typeof parseInt(error.code) === "number")
                    return res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error: error.message })
            });
    };

    async createAccount(req, res) {
        const { username, password, role, status, branch_id } = req.body;
        const data = { username, password, role, status, branch_id };
        return await AccountService.createAccount(data)
            .then(account => res.status(201).json(account))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateAccount(req, res) {
        const { id } = req.params;
        const { password, role, status, branch_id } = req.body;
        const data = { password, role, status, branch_id };
        return await AccountService.updateAccount(id, data)
            .then(account => res.status(200).json(account))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteAccount(req, res) {
        const { id } = req.params;
        return await AccountService.deleteAccount(id)
            .then(account => res.status(200).json(account))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new AccountController();
