import RoomPriceServices from "../services/roomPriceServices.ts";


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
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async getRoomPriceById(req, res) { 
        const { id } = req.params;
        return await RoomPriceServices.getRoomPriceById(id)
        .then(roomPrice => {
            if (!roomPrice) {
                return res.status(404).json({ error: "Room price not found" });
            }
            res.status(200).json(roomPrice);
        })
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async createRoomPrice(req, res) {
        const data = req.body;
        return await RoomPriceServices.createRoomPrice(data)
        .then(createdRoomPrice => res.status(201).json(createdRoomPrice))
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async updateRoomPrice(req, res) {
        const { id } = req.params;
        const data = req.body;
        return await RoomPriceServices.updateRoomPrice(id, data)
        .then(updatedRoomPrice => res.status(200).json(updatedRoomPrice))
        .catch(error => {
            if (error.message === "Room price not found") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };

    async deleteRoomPrice(req, res) {
        const { id } = req.params;
        return await RoomPriceServices.deleteRoomPrice(id)
        .then(deletedRoomPrice => res.status(200).json(deletedRoomPrice))
        .catch(error => {
            if (error.message === "Room price not found") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };
}

export default new RoomPriceController();