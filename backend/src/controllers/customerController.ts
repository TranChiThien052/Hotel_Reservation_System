import CustomerService from '../services/customerServices';

class CustomerController {
    async getAllCustomers(req, res) {
        return await CustomerService.getAllCustomers()
            .then(customers => res.status(200).json(customers))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getCustomerById(req, res) {
        const { id } = req.params;
        return await CustomerService.getCustomerById(id)
            .then(customer => {
                if (!customer) {
                    return res.status(404).json({ error: "Customer not found" });
                }
                res.status(200).json(customer);
            })
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async createCustomer(req, res) {
        const { account_id, full_name, phone, email, id_card_number, nationality, date_of_birth, address } = req.body;
        const data = { account_id, full_name, phone, email, id_card_number, nationality, date_of_birth, address };
        return await CustomerService.createCustomer(data)
            .then(customer => res.status(201).json(customer))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateCustomer(req, res) {
        const { id } = req.params;
        const { account_id, full_name, phone, email, id_card_number, nationality, date_of_birth, address } = req.body;
        const data = { account_id, full_name, phone, email, id_card_number, nationality, date_of_birth, address };
        return await CustomerService.updateCustomer(id, data)
            .then(customer => res.status(200).json(customer))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteCustomer(req, res) {
        const { id } = req.params;
        return await CustomerService.deleteCustomer(id)
            .then(customer => res.status(200).json(customer))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new CustomerController();
