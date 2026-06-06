import RoomTypeRepository from '../repositories/roomTypeRepo.ts';

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
        return await RoomTypeRepository.createRoomType(data);
    };

    async updateRoom(id, data) {
        const existingRoom = await RoomTypeRepository.getRoomTypeById(id);
        if (!existingRoom) {
            throw new Error("Room not found");
        }
        const validatedData = {
        ...(data.branch_id && { branch_id: data.branch_id }),
        ...(data.room_type_id && { room_type_id: data.room_type_id }),
        ...(data.room_number && { room_number: data.room_number }),
        ...(data.floor !== undefined && { floor: data.floor }),
        ...(data.basic && { basic: data.basic }),
        ...(data.extra && { extra: data.extra }),
        ...(data.status && { status: data.status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.is_active !== undefined && { is_active: data.is_active }),
        };
        return await RoomTypeRepository.updateRoomType(id, validatedData);
    };

    async deleteRoom(id) {
        const existingRoom = await RoomTypeRepository.getRoomTypeById(id);
        if (!existingRoom) {
            throw new Error("Room not found");
        }
        return await RoomTypeRepository.deleteRoomType(id);
    };
}

export default new RoomService();