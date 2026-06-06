import RoomTypeRepository from '../repositories/roomTypeRepo.ts';

class RoomTypeService {
    async getAllRoomTypes() {
        return await RoomTypeRepository.getAllRoomTypes();
    };

    async getRoomTypeById(id) {
        return await RoomTypeRepository.getRoomTypeById(id);
    };

    async createRoomType(data) {
        return await RoomTypeRepository.createRoomType(data);
    };

    async updateRoomType(id, data) {
        const existingRoomType = await RoomTypeRepository.getRoomTypeById(id);
        if (!existingRoomType) {
            throw new Error("Room type not found");
        }
        const validatedData = {
            ...(data.branch_id !== undefined && { branch_id: data.branch_id }),
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.max_guests !== undefined && { max_guests: data.max_guests }),
            ...(data.images !== undefined && { images: data.images }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };
        return await RoomTypeRepository.updateRoomType(id, validatedData);
    };

    async deleteRoomType(id) {
        const existingRoomType = await RoomTypeRepository.getRoomTypeById(id);
        if (!existingRoomType) {
            throw new Error("Room type not found");
        }
        return await RoomTypeRepository.deleteRoomType(id);
    };
}

export default new RoomTypeService();