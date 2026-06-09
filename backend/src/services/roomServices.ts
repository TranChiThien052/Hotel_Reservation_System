import RoomTypeRepository from '../repositories/roomTypeRepo.ts';
import { Validator, ValidationError } from '../middlewares/validateData.ts';

class RoomService {
    async getAllRooms() {
        return await RoomTypeRepository.getAllRoomTypes();
    };

    async getRoomsByBranchId(id) {
        const allRooms = await RoomTypeRepository.getAllRoomTypes();
        return allRooms.filter(room => room.branch_id === id);
    };

    async getRoomById(id) {
        return await RoomTypeRepository.getRoomTypeById(id);
    };

    async createRoom(data) {
        const validatedData = {
        ...(data.branch_id && { branch_id: data.branch_id.trim() }),
        ...(data.room_type_id && { room_type_id: data.room_type_id.trim() }),
        ...(data.room_number && { room_number: data.room_number.trim() }),
        ...(data.floor && { floor: data.floor.trim() }),
        ...(data.basic && { basic: data.basic }),
        ...(data.extra && { extra: data.extra }),
        ...(data.status && { status: data.status.trim() }),
        ...(data.notes && { notes: data.notes.trim() }),
        ...(data.is_active && { is_active: data.is_active }),
        };

        const validator = new Validator();

        validator.isEmpty("Branch ID", validatedData.branch_id);
        validator.isEmpty("Room Type ID", validatedData.room_type_id);
        validator.isEmpty("Room Number", validatedData.room_number);
        
        if(validator.isEmpty("Status", validatedData.status)) {
            validator.validateRoomStatus(validatedData.status);
        }

        validator.isNumber("Floor", validatedData.floor);

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        return await RoomTypeRepository.createRoomType(data);
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
        ...(data.is_active && { is_active: data.is_active }),
        };

        const validator = new Validator();

        validator.isNumber("Floor", validatedData.floor);

        if(validatedData.status) {
            validator.validateRoomStatus(validatedData.status);
        }

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const existingRoom = await RoomTypeRepository.getRoomTypeById(id);
        if (!existingRoom) {
            throw new ValidationError('404', "Room not found");
        }

        return await RoomTypeRepository.updateRoomType(id, validatedData);
    };

    async deleteRoom(id) {
        return await RoomTypeRepository.deleteRoomType(id);
    };
}

export default new RoomService();