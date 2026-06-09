import RoomTypeRepository from '../repositories/roomTypeRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class RoomTypeService {
    async getAllRoomTypes() {
        return await RoomTypeRepository.getAllRoomTypes();
    };

    async getRoomTypeById(id) {
        return await RoomTypeRepository.getRoomTypeById(id);
    };

    async createRoomType(data) {
        const validatedData = {
            ...(data.branch_id !== undefined && { branch_id: data.branch_id }),
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.max_guests !== undefined && { max_guests: data.max_guests }),
            ...(data.images !== undefined && { images: data.images }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        const validator = new Validator();
        validator.isEmpty("Branch ID", validatedData.branch_id);

        validator.isEmpty("Name", validatedData.name);

        if (validator.isNumber("Max Guests", validatedData.max_guests)) {
            if(validatedData.max_guests <= 0) {
                validator.pushError("Max Guests must be greater than 0");
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await RoomTypeRepository.createRoomType(validatedData);
    };

    async updateRoomType(id, data) {
        const validator = new Validator();
        const existingRoomType = await RoomTypeRepository.getRoomTypeById(id);
        if (!existingRoomType) {
            throw new ValidationError('404', "Room type not found");
        }
        const validatedData = {
            ...(data.branch_id !== undefined && { branch_id: data.branch_id }),
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.max_guests !== undefined && { max_guests: data.max_guests }),
            ...(data.images !== undefined && { images: data.images }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        if (validator.isNumber("Max Guests", validatedData.max_guests)) {
            if(validatedData.max_guests <= 0) {
                validator.pushError("Max Guests must be greater than 0");
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await RoomTypeRepository.updateRoomType(id, validatedData);
    };

    async deleteRoomType(id) {
        return await RoomTypeRepository.deleteRoomType(id);
    };
}

export default new RoomTypeService();