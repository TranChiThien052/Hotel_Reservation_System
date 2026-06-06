import RoomServiceRepository from '../repositories/roomServiceRepo.ts';

class RoomServiceService {
    async getAllServices() {
        return await RoomServiceRepository.getAllServices();
    };

    async getServiceById(id) {
        return await RoomServiceRepository.getServiceById(id);
    };

    async createService(data) {
        return await RoomServiceRepository.createService(data);
    };  

    async updateService(id, data) {
        const existingService = await RoomServiceRepository.getServiceById(id);
        if (!existingService) {
            throw new Error("Service not found");
        }
        const validatedData = {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.price !== undefined && { price: data.price }),
            ...(data.unit !== undefined && { unit: data.unit }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };
        return await RoomServiceRepository.updateService(id, validatedData);
    };

    async deleteService(id) {
        const existingService = await RoomServiceRepository.getServiceById(id);
        if (!existingService) {
            throw new Error("Service not found");
        }
        return await RoomServiceRepository.deleteService(id);
    };
}

export default new RoomServiceService();