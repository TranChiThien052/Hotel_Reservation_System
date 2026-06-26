import StaffService from '../services/staffServices';

class StaffController {
    async getAllStaff(req, res) {
        return await StaffService.getAllStaff()
            .then(staff => res.status(200).json(staff))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getStaffById(req, res) {
        const { id } = req.params;
        return await StaffService.getStaffById(id)
            .then(staff => {
                if (!staff) {
                    return res.status(404).json({ error: "Staff not found" });
                }
                res.status(200).json(staff);
            })
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getStaffByBranchId(req, res) {
        const { id } = req.params;
        return await StaffService.getStaffByBranchId(id)
            .then(staff => res.status(200).json(staff))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number')
                    res.status(parseInt(error.code)).json({ error: error.message });
                res.status(500).json({ error: error.message })
            });
    };

    async createStaff(req, res) {
        const { branch_id, account_id, full_name, phone, position } = req.body;
        const data = { branch_id, account_id, full_name, phone, position };
        return await StaffService.createStaff(data)
            .then(staff => res.status(201).json(staff))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateStaff(req, res) {
        const { id } = req.params;
        const { branch_id, full_name, phone, position } = req.body;
        const data = { branch_id, full_name, phone, position };
        return await StaffService.updateStaff(id, data)
            .then(staff => res.status(200).json(staff))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteStaff(req, res) {
        const { id } = req.params;
        return await StaffService.deleteStaff(id)
            .then(staff => res.status(200).json(staff))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new StaffController();
