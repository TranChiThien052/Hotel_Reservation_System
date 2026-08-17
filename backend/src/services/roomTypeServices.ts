import RoomTypeRepository from '../repositories/roomTypeRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import BranchRepository from '../repositories/branchRepo';
import RoomImageRepository from '../repositories/roomImageRepo';
import { deleteImage, uploadImage } from '../middlewares/uploader';
import { prisma } from '../config/prisma';
import historyTransactionServices from './historyTransactionServices';
import branchServices from './branchServices';

class RoomTypeService {
    async getAllRoomTypes() {
        return await RoomTypeRepository.getAllRoomTypes();
    };

    async getRoomTypeById(id) {
        const validator = new Validator();
        if (!validator.isUUID("Room Type ID", id))
            throw new ValidationError("400", validator.clearError());
        return await RoomTypeRepository.getRoomTypeById(id);
    };

    async getRoomTypesByBranchId(branchId) {
        const branchExists = await branchServices.getBranchById(branchId);
        if (!branchExists) {
            throw new ValidationError('404', "Branch not found");
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

        const branch = await branchServices.getBranchById(validatedData.branch_id);
        if (!branch)
            throw new ValidationError("404", "Branch not found");
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

        try {
            const result = await RoomTypeRepository.createRoomType(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id,
                    "Loại phòng",
                    result.id,
                    result
                );

            if (result && files && files.length > 0) {
                const uploadedFiles = await uploadImage(files);
                await RoomImageRepository.createRoomImages(result.id, uploadedFiles);
            }
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async updateRoomType(id, data) {
        const existingRoomType = await this.getRoomTypeById(id);
        if (!existingRoomType)
            throw new ValidationError("404", "Room Type not found");
        const validatedData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.max_guests && { max_guests: data.max_guests }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        const validator = new Validator();

        if (validatedData.branch_id) {
            const branchExists = await BranchRepository.getBranchById(validatedData.branch_id);
            if (!branchExists) {
                throw new ValidationError("404", "Branch not found");
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

        try {
            const after = await RoomTypeRepository.updateRoomType(id, validatedData);
            if (after)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id,
                    "Loại phòng",
                    id,
                    existingRoomType,
                    after,
                    Object.keys(validatedData)
                );
            return after;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async addRoomTypeImage(data) {
        if (!data.files || data.files.length === 0) {
            throw new ValidationError('400', "No image files provided");
        }
        const uploadedFiles = await uploadImage(data.files);
        try {
            return await RoomImageRepository.createRoomImages(data.id, uploadedFiles);
        } catch (error: any) {
            throw new Error(error);
        }
    }

    async deleteRoomTypeImage(data) {
        try {
            return await prisma.$transaction(async () => {
                await deleteImage(data.public_id);
                const deleteResult = await RoomImageRepository.deleteRoomTypeImage(data.img_url);
                return deleteResult;
            })
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async deleteRoomType(id) {
        return await RoomTypeRepository.deleteRoomType(id);
    };
}

export default new RoomTypeService();