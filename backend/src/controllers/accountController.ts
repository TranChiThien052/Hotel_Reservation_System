import AccountService from '../services/accountServices';

class AccountController {
    async resetPassword(req, res) {
        const { newPassword } = req.body;
        const token = req.query.token;
        return await AccountService.resetPassword(newPassword, token)
            .then(response => res.status(201).json(response))
            .catch(error => {
                if (typeof parseInt(error.code) === "number") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async requestResetPassword(req, res) {
        const { email } = req.body;
        return await AccountService.requestPasswordReset(email)
            .then(response => res.status(201).json(response))
            .catch(error => {
                if (typeof parseInt(error.code) === "number") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async login(req, res) {
        const { username, password } = req.body;
        return await AccountService.login(username, password)
            .then(token => {
                res.cookie('refresh_token', token.refresh_token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    path: '/auth',
                    maxAge: 24 * 60 * 60 * 1000,
                });
                res.status(200).json({
                    access_token: token.access_token,
                });
            })
            .catch(error => {
                if (typeof parseInt(error.code) === "number") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ code: error.code, error: error.message });
            });
    };

    async refreshToken(req, res) {
        const refresh_token = req.cookies.refresh_token;
        return await AccountService.refreshToken(refresh_token)
            .then(token => {
                res.cookie('refresh_token', token.refresh_token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    path: '/auth',
                    maxAge: 24 * 60 * 60 * 1000,
                });
                res.status(200).json({
                    access_token: token.access_token,
                });
            })
            .catch(error => {
                if (typeof parseInt(error.code) === "number") {
                    res.clearCookie("refresh_token", {
                        httpOnly: true,
                        secure: true,
                        sameSite: "None",
                        path: "/auth",
                    });
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.clearCookie("refresh_token", {
                    httpOnly: true,
                    secure: true,
                    sameSite: "None",
                    path: "/auth",
                });
                res.status(401).json({ error: error.message });
            });
    };

    async logout(req, res) {
        const refresh_token = req.cookies.refresh_token;
        return await AccountService.logout(refresh_token)
            .then(response => {
                res.clearCookie('refresh_token', {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'None',
                    path: '/auth',
                });
                res.status(200).json({ message: response.message });
            })
            .catch(error => {
                if (typeof parseInt(error.code) === "number") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async createStaffAccount(req, res) {
        const { username, password, role, status, branch_id, full_name, phone } = req.body;
        const data = { username, password, role, status, branch_id, full_name, phone };
        return await AccountService.registerStaffAccount(data)
            .then(response => res.status(201).json(response))
            .catch(error => {
                if (typeof parseInt(error.code) === "number") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    }

    async createCustomerAccount(req, res) {
        const { full_name, phone, email, password } = req.body;
        const data = { full_name, phone, email, password };
        return await AccountService.registerCustomerAccount(data)
            .then(response => res.status(201).json(response))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number')
                    return res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error })
            })
    }

    async getAccountInformation(req, res) {
        const token = req.headers.authorization.split(' ')[1];
        return await AccountService.getAccountInformationFromToken(token)
            .then(account => res.status(200).json(account))
            .catch(error => res.status(500).json({ error: error.message }));
    }

    async getAllAccounts(req, res) {
        return await AccountService.getAllAccounts()
            .then(accounts => res.status(200).json(accounts))
            .catch(error => res.status(500).json({ code: error.code, error: error.message }));
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
                console.log(error)
                if (typeof parseInt(error.code) === 'number') {
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
                if (typeof parseInt(error.code) === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                } else if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteAccount(req, res) {
        const { id } = req.params;
        return await AccountService.deleteAccount(id)
            .then(account => res.status(200).json(account))
            .catch(error => {
                if (typeof parseInt(error.code) === "number") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                } else if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new AccountController();
