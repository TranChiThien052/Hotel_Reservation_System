import RoomTypeRepository from '../repositories/roomTypeRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';
import BranchRepository from '../repositories/branchRepo.ts';

class RoomTypeService {
    async getAllRoomTypes() {
        return await RoomTypeRepository.getAllRoomTypes();
    };

    async getRoomTypeById(id) {
        return await RoomTypeRepository.getRoomTypeById(id);
    };

    async getRoomTypesByBranchId(branchId) {
        const validator = new Validator();
        if(validator.isUUID("Branch ID", branchId)) {
            const branchExists = await BranchRepository.getBranchById(branchId);
            if (!branchExists) {
                throw new ValidationError('400', "Invalid branch ID");
            }
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }
        
        return await RoomTypeRepository.getRoomTypesByBranchId(branchId);
    };

    async createRoomType(data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.max_guests && { max_guests: data.max_guests }),
            ...(data.images && { images: data.images }),
            ...(data.is_active && { is_active: data.is_active }),
        };

        const validator = new Validator();
        
        if(!validator.isEmpty("Branch ID", validatedData.branch_id))
            validator.isUUID("Branch ID", validatedData.branch_id);
        if(!validator.isEmpty("Name", validatedData.name))
            validator.isString("Name", validatedData.name);
        
        if(validatedData.description) {
            validator.isString("Description", validatedData.description);
        }
        
        if(validatedData.max_guests) {
            validator.isPositiveNumber("Max Guests", validatedData.max_guests);
        }
        
        if(validatedData.images) {
            validator.isArray("Images", validatedData.images);
        }
        
        if(validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
        if (!branchExists) {
            throw new ValidationError('400', "Invalid branch ID");
        }

        return await RoomTypeRepository.createRoomType(validatedData);
    };

    async updateRoomType(id, data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.max_guests && { max_guests: data.max_guests }),
            ...(data.images && { images: data.images }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        const validator = new Validator();

        if(validatedData.branch_id) {
            if(validator.isUUID("Branch ID", validatedData.branch_id)) {
                const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
                if (!branchExists) {
                    validator.pushError("Invalid branch ID");
                }
            }
        }
        if(validatedData.name) {
            validator.isString("Name", validatedData.name);
        }
        if(validatedData.description) {
            validator.isString("Description", validatedData.description);
        }
        if(validatedData.max_guests) {
            validator.isPositiveNumber("Max Guests", validatedData.max_guests);
        }
        if(validatedData.images) {
            validator.isArray("Images", validatedData.images);
        }
        if(validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const existingRoomType = await RoomTypeRepository.getRoomTypeById(id);
        if (!existingRoomType) {
            throw new ValidationError('404', "Room type not found");
        }

        return await RoomTypeRepository.updateRoomType(id, validatedData);
    };

    async deleteRoomType(id) {
        return await RoomTypeRepository.deleteRoomType(id);
    };
}

export default new RoomTypeService();