import RoomServices from '../services/roomServices.ts';

class RoomController {
    async getAllRooms(req, res) {
        return await RoomServices.getAllRooms()
        .then(rooms => res.status(200).json(rooms))
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async getRoomsByBranchId(req, res) {
        const { branchId } = req.params;
        return await RoomServices.getRoomsByBranchId(branchId)
        .then(rooms => res.status(200).json(rooms))
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async getRoomById(req, res) {
        const { id } = req.params;
        return await RoomServices.getRoomById(id)
        .then(room => {
            if (!room) {
                return res.status(404).json({ error: "Room not found" });
            }
            res.status(200).json(room);
        })
        .catch(error => res.status(500).json({ error: error.message }));
    };

    async createRoom(req, res) {
        const { branch_id, room_type_id, room_number, floor, basic, extra, status, notes, is_active } = req.body;
        const data = { branch_id, room_type_id, room_number, floor, basic, extra, status, notes, is_active };
        return await RoomServices.createRoom(data)
        .then(createdRoom => res.status(201).json(createdRoom))
        .catch(error => {
            if (error.code !== 500) {
                return res.status(parseInt(error.code)).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };

    async updateRoom(req, res) {
        const { id } = req.params;
        const { branch_id, room_type_id, room_number, floor, basic, extra, status, notes, is_active } = req.body;
        const data = { branch_id, room_type_id, room_number, floor, basic, extra, status, notes, is_active };
        return await RoomServices.updateRoom(id, data)
        .then(updatedRoom => res.status(200).json(updatedRoom))
        .catch(error => {
            if (error.code !== 500) {
                return res.status(parseInt(error.code)).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };

    async deleteRoom(req, res) {
        const { id } = req.params;
        return await RoomServices.deleteRoom(id)
        .then(deletedRoom => res.status(200).json(deletedRoom))
        .catch(error => {
            if (error.code === "P2025") {
                return res.status(404).json({ error: error.message });
            }
            res.status(500).json({ error: error.message });
        });
    };
}

export default new RoomController();