import { prisma } from "../config/prisma.ts";

const getAllBranches = async (req, res) => {
    try {
        const branches = await prisma.branches.findMany();
        res.status(200).json(branches);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve branches" });
    }
}

const getBranchById = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await prisma.branches.findUnique({
            where: { id: id },
        });
        if (!branch) {
            return res.status(404).json({ error: "Branch not found" });
        }
        res.status(200).json(branch);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve branch" });
    }
}

const createBranch = async (req, res) => {
    try {
        const newBranch = req.body;
        const createdBranch = await prisma.branches.create({
            data: newBranch,
        });
        res.status(201).json(createdBranch);
    } catch (error) {
        res.status(500).json({ error: "Failed to create branch" });
    }
}

const updateBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const branch = await prisma.branches.findUnique({ where: { id: id } });

        if (branch) {
            const updateData = {
            ...(data.name && { name: data.name }),
            ...(data.address && { address: data.address }),
            ...(data.city && { city: data.city }),
            ...(data.phone && { phone: data.phone }),
            ...(data.email && { email: data.email }),
            ...(data.description && { description: data.description }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
            };

            const updatedBranch = await prisma.branches.update({
            where: { id },
            data: updateData,
            });

            res.status(200).json(updatedBranch);
        } else {
            res.status(404).json({ error: "Branch not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to update branch: " + error.message });
    }
}

const deleteBranch = async (req, res) => {
    try {
        const { id } = req.params;
        const branch = await prisma.branches.findUnique({ where: { id: id }});
        if (branch) {
            const deletedBranch = await prisma.branches.delete({ where: { id: id }});
            res.status(200).json(deletedBranch);
        } else {
            res.status(404).json({ error: "Branch not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to delete branch: " + error.message });
    }
}

export { getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch };