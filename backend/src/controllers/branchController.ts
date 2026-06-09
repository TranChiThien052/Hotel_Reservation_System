import BranchServices from "../services/branchServices.ts";

class BranchController {
    async getAllBranches(req, res) {
        return await BranchServices.getAllBranches()
        .then(branches => res.status(200).json(branches))
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async getBranchById(req, res) {
        const { id } = req.params;
        return await BranchServices.getBranchById(id)
        .then(branch => {
            if (!branch) {
                return res.status(404).json({ error: "Branch not found" });
            }
            res.status(200).json(branch);
        })
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async createBranch(req, res) {
        const { name, address, city, phone, email, description, is_active } = req.body;
        const data = { name, address, city, phone, email, description, is_active };
        return await BranchServices.createBranch(data)
        .then(createdBranch => res.status(201).json(createdBranch))
        .catch(error => {
            if (error.code !== 500) {
                return res.status(parseInt(error.code)).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        })
    };

    async updateBranch(req, res) {
        const { id } = req.params;
        const { name, address, city, phone, email, description, is_active } = req.body;
        const data = { name, address, city, phone, email, description, is_active };
        return await BranchServices.updateBranch(id, data)
        .then(updatedBranch => res.status(200).json(updatedBranch))
        .catch(error => {
            if (error.code !== 500) {
                return res.status(parseInt(error.code)).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };

    async deleteBranch(req, res) {
        const { id } = req.params;
        return await BranchServices.deleteBranch(id)
        .then(deletedBranch => res.status(200).json(deletedBranch))
        .catch(error => {
            if (error.code === "P2025") {
                return res.status(404).json({ error: "Branch not found" });
            }
            res.status(500).json({ error: error.message });
        });
    };
}

export default new BranchController();