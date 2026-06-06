import RoomPriceService from "../services/roomPriceServices.ts";


class RoomPriceController {
    async getAllRoomPrices (req, res) {
        try {
            const roomPrices = await RoomPriceService.getAllRoomPrices();
            res.status(200).json(roomPrices);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve room prices: " + error.message });
        }
    };

    async getRoomPricesByRoomTypeId (req, res) {
        try {
            const { id } = req.params;
            const roomPrices = await RoomPriceService.getRoomPricesByRoomTypeId(id);
            res.status(200).json(roomPrices);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve room prices: " + error.message });
        }
    };

    async getRoomPriceById (req, res) {
        try {
            const { id } = req.params;
            const roomPrice = await RoomPriceService.getRoomPriceById(id);
            if (!roomPrice) {
                return res.status(404).json({ error: "Room price not found" });
            }
            res.status(200).json(roomPrice);
        } catch (error) {
            res.status(500).json({ error: "Failed to retrieve room price: " + error.message });
        }
    };

    async createRoomPrice (req, res) {
        try {
            const newRoomPrice = req.body;
            const createdRoomPrice = await RoomPriceService.createRoomPrice(newRoomPrice);
            res.status(201).json(createdRoomPrice);
        } catch (error) {
            res.status(500).json({ error: "Failed to create room price: " + error.message });
        }
    };

    async updateRoomPrice (req, res) {
        try {
            const { id } = req.params;
            const data = req.body;
            const roomPrice = await RoomPriceService.getRoomPriceById(id);

            if (!roomPrice) {
                return res.status(404).json({ error: "Room price not found" });
            }

            const updatedRoomPrice = await RoomPriceService.updateRoomPrice(id, data);
            res.status(200).json(updatedRoomPrice);
        } catch (error) {
            res.status(500).json({ error: "Failed to update room price: " + error.message });
        }
    };

    async deleteRoomPrice (req, res) {
        try {
            const { id } = req.params;
            const roomPrice = await RoomPriceService.getRoomPriceById(id);
            if (!roomPrice) {
                return res.status(404).json({ error: "Room price not found" });
            }
            const deletedRoomPrice = await RoomPriceService.deleteRoomPrice(id);
            res.status(200).json({ deletedRoomPrice });
        } catch (error) {
            res.status(500).json({ error: "Failed to delete room price: " + error.message });
        }   
    };
}

export default new RoomPriceController();