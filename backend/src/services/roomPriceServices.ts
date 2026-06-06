import RoomPriceRepository from '../repositories/roomPriceRepo.ts';

class RoomPriceService {
    async getAllRoomPrices() {
        return await RoomPriceRepository.getAllRoomPrices();
    };

    async getRoomPriceById(id) {
        return await RoomPriceRepository.getRoomPriceById(id);
    };

    async getRoomPricesByRoomTypeId(room_type_id) {
        return await RoomPriceRepository.getRoomPricesByRoomTypeId(room_type_id);
    };

    async createRoomPrice(data) {
        return await RoomPriceRepository.createRoomPrice(data);
    };

    async updateRoomPrice(id, data) {
        const existingRoomPrice = await RoomPriceRepository.getRoomPriceById(id);
        if (!existingRoomPrice) {
            throw new Error("Room price not found");
        }
        const validatedData = {
        ...(data.room_type_id && { room_type_id: data.room_type_id }),
        ...(data.price_per_day && { price_per_day: data.price_per_day }),
        ...(data.price_per_hour && { price_per_hour: data.price_per_hour }),
        ...(data.weekend_rate && { weekend_rate: data.weekend_rate }),
        ...(data.holiday_rate && { holiday_rate: data.holiday_rate }),
        ...(data.effective_from && { effective_from: data.effective_from }),
        ...(data.effective_to && { effective_to: data.effective_to }),
        }
        return await RoomPriceRepository.updateRoomPrice(id, validatedData);
    };

    async deleteRoomPrice(id) {
        const existingRoomPrice = await RoomPriceRepository.getRoomPriceById(id);
        if (!existingRoomPrice) {
            throw new Error("Room price not found");
        }
        return await RoomPriceRepository.deleteRoomPrice(id);
    };
}

export default new RoomPriceService();