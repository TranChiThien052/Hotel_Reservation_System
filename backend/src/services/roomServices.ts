import RoomRepository from '../repositories/roomRepo';
import BranchRepository from '../repositories/branchRepo';
import RoomTypeRepository from '../repositories/roomTypeRepo';
import { Validator, ValidationError } from '../middlewares/validateData';
import historyTransactionServices from './historyTransactionServices';

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

        if (!validator.isEmpty("Branch ID", validatedData.branch_id))
            validator.isUUID("Branch ID", validatedData.branch_id);
        if (!validator.isEmpty("Room Type ID", validatedData.room_type_id))
            validator.isUUID("Room Type ID", validatedData.room_type_id);
        if (!validator.isEmpty("Room Number", validatedData.room_number))
            validator.isString("Room Number", validatedData.room_number);
        if (!validator.isEmpty("Status", validatedData.status))
            validator.validateRoomStatus(validatedData.status);

        if (validatedData.floor) {
            validator.isNonNegativeNumber("Floor", validatedData.floor);
        }

        if (validatedData.basic) {
            validator.isArray("Basic", validatedData.basic);
        }

        if (validatedData.extra) {
            validator.isArray("Extra", validatedData.extra);
        }

        if (validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }

        if (validatedData.room_charge[0] != validatedData.floor)
            validator.pushError('Room number is not match with floor');

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

        const existingRoomsFromBranch = await RoomRepository.getRoomsByBranchId(validatedData.branch_id);
        if (existingRoomsFromBranch.some(room => room.room_number === validatedData.room_number))
            throw new ValidationError('409', 'Room number already exists in this branch');

        try {
            const result = await RoomRepository.createRoom(validatedData);
            if (result)
                await historyTransactionServices.createCreateTransaction(
                    data.log_account_id ?? null,
                    "Phòng",
                    result.id,
                    result
                );
            return result;
        } catch (error: any) {
            throw new Error(error);
        }
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

        if (validatedData.branch_id) {
            validator.isUUID("Branch ID", validatedData.branch_id);
        }
        if (validatedData.room_type_id) {
            validator.isUUID("Room Type ID", validatedData.room_type_id);
        }
        if (validatedData.room_number) {
            validator.isString("Room Number", validatedData.room_number);
            validator.maxLength("Room Number", validatedData.room_number, 20);
        }
        if (validatedData.floor !== undefined) {
            validator.isNonNegativeNumber("Floor", validatedData.floor);
        }
        if (validatedData.status) {
            validator.validateRoomStatus(validatedData.status);
        }
        if (validatedData.basic) {
            validator.isArray("Basic", validatedData.basic);
        }
        if (validatedData.extra) {
            validator.isArray("Extra", validatedData.extra);
        }
        if (validatedData.is_active !== undefined) {
            validator.isBoolean("Is Active", validatedData.is_active);
        }
        if (validatedData.room_number[0] != validatedData.floor)
            validator.pushError('Room number is not match with floor');

        if (validator.error.length > 0) {
            throw new ValidationError('400', validator.clearError());
        }

        const existingRoom = await RoomRepository.getRoomById(id);
        if (!existingRoom) {
            throw new ValidationError('404', "Room not found");
        }

        const existingRoomFromBranch = await RoomRepository.getRoomsByBranchId(existingRoom.branch_id);
        if (existingRoomFromBranch.some(room => room.room_number === validatedData.room_number && room.id !== id))
            throw new ValidationError('409', 'Room number already exists in this branch');

        try {
            const after = await RoomRepository.updateRoom(id, validatedData);
            if (after)
                await historyTransactionServices.createUpdateTransaction(
                    data.log_account_id,
                    "Phòng",
                    id,
                    existingRoom,
                    after,
                    Object.keys(validatedData)
                );
            return after;
        } catch (error: any) {
            throw new Error(error);
        }
    };

    async deleteRoom(id) {
        return await RoomRepository.deleteRoom(id);
    };
}

export default new RoomService();