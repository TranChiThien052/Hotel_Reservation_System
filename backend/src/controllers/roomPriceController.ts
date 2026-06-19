import RoomPriceServices from "../services/roomPriceServices";


class RoomPriceController {
    async getAllRoomPrices(req, res) {
        return await RoomPriceServices.getAllRoomPrices()
            .then(roomPrices => res.status(200).json(roomPrices))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getRoomPricesByRoomTypeId(req, res) {
        const { id } = req.params;
        return await RoomPriceServices.getRoomPricesByRoomTypeId(id)
            .then(roomPrices => res.status(200).json(roomPrices))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async getRoomPriceById(req, res) {
        const { id } = req.params;
        return await RoomPriceServices.getRoomPriceById(id)
            .then(roomPrice => res.status(200).json(roomPrice))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async createRoomPrice(req, res) {
        const { room_type_id, price_per_day, price_per_hour, weekend_rate, holiday_rate, effective_from, effective_to } = req.body;
        const data = { room_type_id, price_per_day, price_per_hour, weekend_rate, holiday_rate, effective_from, effective_to };
        return await RoomPriceServices.createRoomPrice(data)
            .then(createdRoomPrice => res.status(201).json(createdRoomPrice))
            .catch(error => {
                console.error("Error creating room price:", error);
                if (typeof error.code === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateRoomPrice(req, res) {
        const { id } = req.params;
        const { room_type_id, price_per_day, price_per_hour, weekend_rate, holiday_rate, effective_from, effective_to } = req.body;
        const data = { room_type_id, price_per_day, price_per_hour, weekend_rate, holiday_rate, effective_from, effective_to };
        return await RoomPriceServices.updateRoomPrice(id, data)
            .then(updatedRoomPrice => res.status(200).json(updatedRoomPrice))
            .catch(error => {
                if (typeof error.code === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ code: error.code, error: error.message });
            });
    };

    async deleteRoomPrice(req, res) {
        const { id } = req.params;
        return await RoomPriceServices.deleteRoomPrice(id)
            .then(deletedRoomPrice => res.status(200).json(deletedRoomPrice))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(404).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };
}

export default new RoomPriceController();