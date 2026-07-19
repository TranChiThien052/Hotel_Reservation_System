import RoomTypeRepository from '../repositories/roomTypeRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import BranchRepository from '../repositories/branchRepo';
import RoomImageRepository from '../repositories/roomImageRepo';
import { deleteImage, uploadImage } from '../middlewares/uploader';
import { prisma } from '../config/prisma';
import historyTransactionServices from './historyTransactionServices';

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

        try {
            const result = await RoomTypeRepository.createRoomType(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id,
                    "Room Type",
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

        try {
            const after = await RoomTypeRepository.updateRoomType(id, validatedData);
            if (after)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id,
                    "Room Type",
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
            const result = await RoomImageRepository.createRoomImages(data.id, uploadedFiles);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id,
                    "Room Image",
                    result[0].room_type_id,
                    result[0]
                );
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    }

    async deleteRoomTypeImage(data) {
        try {
            const result = await prisma.$transaction(async () => {
                await deleteImage(data.public_id);
                const deleteResult = await RoomImageRepository.deleteRoomTypeImage(data.img_url);
                return deleteResult;
            })
            if (result)
                await historyTransactionServices.createDeleteTransaction(
                    data.log_account_id,
                    "Room Image",
                    result.room_type_id,
                    result
                );
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async deleteRoomType(id) {
        return await RoomTypeRepository.deleteRoomType(id);
    };
}

export default new RoomTypeService();