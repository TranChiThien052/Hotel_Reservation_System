import RoomTypeRepository from '../repositories/roomTypeRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import BranchRepository from '../repositories/branchRepo';
import RoomImageRepository from '../repositories/roomImageRepo';
import { deleteImage, uploadImage } from '../middlewares/uploader';
import { prisma } from '../config/prisma';

class RoomTypeService {
    async getAllRoomTypes() {
        return await RoomTypeRepository.getAllRoomTypes();
    };

    async getRoomTypeById(id) {
        return await RoomTypeRepository.getRoomTypeById(id);
    };

    async getRoomTypesByBranchId(branchId) {
        const validator = new Validator();
        if (validator.isUUID("Branch ID", branchId)) {
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

    async createRoomType(data, files) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.max_guests && { max_guests: data.max_guests }),
            ...(data.is_active && { is_active: data.is_active }),
        };

        const validator = new Validator();

        if (!validator.isEmpty("Branch ID", validatedData.branch_id))
            validator.isUUID("Branch ID", validatedData.branch_id);
        if (!validator.isEmpty("Name", validatedData.name))
            validator.isString("Name", validatedData.name);

        if (validatedData.description) {
            validator.isString("Description", validatedData.description);
        }

        if (validatedData.max_guests) {
            validator.isPositiveNumber("Max Guests", validatedData.max_guests);
        }

        if (validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
        if (!branchExists) {
            throw new ValidationError('400', "Invalid branch ID");
        }

        const result = await RoomTypeRepository.createRoomType(validatedData);

        if (files && files.length > 0) {
            const uploadedFiles = await uploadImage(files);
            await RoomImageRepository.createRoomImages(result.id, uploadedFiles);
        }

        return result;
    };

    async updateRoomType(id, data) {
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.max_guests && { max_guests: data.max_guests }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        const validator = new Validator();

        if (validatedData.branch_id) {
            if (validator.isUUID("Branch ID", validatedData.branch_id)) {
                const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
                if (!branchExists) {
                    validator.pushError("Invalid branch ID");
                }
            }
        }
        if (validatedData.name) {
            validator.isString("Name", validatedData.name);
        }
        if (validatedData.description) {
            validator.isString("Description", validatedData.description);
        }
        if (validatedData.max_guests) {
            validator.isPositiveNumber("Max Guests", validatedData.max_guests);
        }
        if (validatedData.is_active !== undefined) {
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

    async deleteRoomTypeImage(img_url, public_id) {
        try {
            const result = await prisma.$transaction(async () => {
                await deleteImage(public_id);
                await RoomImageRepository.deleteRoomTypeImage(img_url);
            })
            return result;
        } catch (error) {
            throw new ValidationError('500', 'Internal server error');
        }
    };

    async deleteRoomType(id) {
        return await RoomTypeRepository.deleteRoomType(id);
    };
}

export default new RoomTypeService();