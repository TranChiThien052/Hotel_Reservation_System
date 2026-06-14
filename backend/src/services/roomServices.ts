import RoomRepository from '../repositories/roomRepo.ts';
import BranchRepository from '../repositories/branchRepo.ts';
import RoomTypeRepository from '../repositories/roomTypeRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class RoomService {
    async getAllRooms() {
        return await RoomRepository.getAllRooms();
    };

    async getRoomsByBranchId(id) {
        const allRooms = await RoomRepository.getAllRooms();
        return allRooms.filter(room => room.branch_id === id);
    };

    async getRoomById(id) {
        return await RoomRepository.getRoomById(id);
    };

    async createRoom(data) {
        const validatedData = {
        ...(data.branch_id && { branch_id: data.branch_id.trim() }),
        ...(data.room_type_id && { room_type_id: data.room_type_id.trim() }),
        ...(data.room_number && { room_number: data.room_number.trim() }),
        ...(data.floor && { floor: data.floor }),
        ...(data.basic && { basic: data.basic }),
        ...(data.extra && { extra: data.extra }),
        ...(data.status && { status: data.status.trim() }),
        ...(data.notes && { notes: data.notes.trim() }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        const validator = new Validator();

        if(!validator.isEmpty("Branch ID", validatedData.branch_id))
            validator.isUUID("Branch ID", validatedData.branch_id);
        if(!validator.isEmpty("Room Type ID", validatedData.room_type_id))
            validator.isUUID("Room Type ID", validatedData.room_type_id);
        if(!validator.isEmpty("Room Number", validatedData.room_number))
            validator.isString("Room Number", validatedData.room_number);
        if(!validator.isEmpty("Status", validatedData.status))
            validator.validateRoomStatus(validatedData.status);

        if(validatedData.floor) {
            validator.isNonNegativeNumber("Floor", validatedData.floor);
        }
        
        if(validatedData.basic) {
            validator.isArray("Basic", validatedData.basic);
        }
        
        if(validatedData.extra) {
            validator.isArray("Extra", validatedData.extra);
        }
        
        if(validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const branches = await BranchRepository.getBranchById(validatedData.branch_id);

        if (!branches) {
            throw new ValidationError('400', "Invalid branch ID");
        }

        const roomTypes = await RoomTypeRepository.getRoomTypeById(validatedData.room_type_id);

        if (!roomTypes) {
            throw new ValidationError('400', "Invalid room type ID");
        }

        return await RoomRepository.createRoom(data);
    };

    async updateRoom(id, data) {
        const validatedData = {
        ...(data.branch_id && { branch_id: data.branch_id }),
        ...(data.room_type_id && { room_type_id: data.room_type_id }),
        ...(data.room_number && { room_number: data.room_number }),
        ...(data.floor && { floor: data.floor }),
        ...(data.basic && { basic: data.basic }),
        ...(data.extra && { extra: data.extra }),
        ...(data.status && { status: data.status }),
        ...(data.notes && { notes: data.notes }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        };

        const validator = new Validator();

        // Type validation for PUT
        if(validatedData.branch_id) {
            validator.isUUID("Branch ID", validatedData.branch_id);
        }
        if(validatedData.room_type_id) {
            validator.isUUID("Room Type ID", validatedData.room_type_id);
        }
        if(validatedData.room_number) {
            validator.isString("Room Number", validatedData.room_number);
            validator.maxLength("Room Number", validatedData.room_number, 20);
        }
        if(validatedData.floor !== undefined) {
            validator.isNonNegativeNumber("Floor", validatedData.floor);
        }
        if(validatedData.status) {
            validator.validateRoomStatus(validatedData.status);
        }
        if(validatedData.basic) {
            validator.isArray("Basic", validatedData.basic);
        }
        if(validatedData.extra) {
            validator.isArray("Extra", validatedData.extra);
        }
        if(validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const existingRoom = await RoomRepository.getRoomById(id);
        if (!existingRoom) {
            throw new ValidationError('404', "Room not found");
        }

        return await RoomRepository.updateRoom(id, validatedData);
    };

    async deleteRoom(id) {
        return await RoomRepository.deleteRoom(id);
    };
}

export default new RoomService();