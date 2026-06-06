import branchRepository from '../repositories/branchRepo.ts';

class BranchService {
    async getAllBranches() {
        return await branchRepository.getAllBranches();
    };

    async getBranchById(id) {
        return await branchRepository.getBranchById(id);
    };

    async createBranch(data) {
        return await branchRepository.createBranch(data);
    };

    async updateBranch(id, data) {
        const existingBranch = await branchRepository.getBranchById(id);
        if (!existingBranch) {
            throw new Error("Branch not found");
        }
        const validatedData = {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.city !== undefined && { city: data.city }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.email !== undefined && { email: data.email }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };
        return await branchRepository.updateBranch(id, validatedData);
    };

    async deleteBranch(id) {
        const existingBranch = await branchRepository.getBranchById(id);
        if (!existingBranch) {
            throw new Error("Branch not found");
        }
        return await branchRepository.deleteBranch(id);
    };
}

export default new BranchService();