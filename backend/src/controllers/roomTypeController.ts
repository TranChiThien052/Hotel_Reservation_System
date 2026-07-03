import RoomTypeServices from '../services/roomTypeServices';

class RoomTypeController {
    async getAllRoomTypes(req, res) {
        return await RoomTypeServices.getAllRoomTypes()
            .then(roomTypes => res.status(200).json(roomTypes))
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getRoomTypeById(req, res) {
        const { id } = req.params;
        return await RoomTypeServices.getRoomTypeById(id)
            .then(roomType => {
                if (!roomType) {
                    return res.status(404).json({ error: "Room type not found" });
                }
                res.status(200).json(roomType);
            })
            .catch(error => res.status(500).json({ error: error.message }));
    };

    async getRoomTypesByBranchId(req, res) {
        const { id } = req.params;
        return await RoomTypeServices.getRoomTypesByBranchId(id)
            .then(roomTypes => res.status(200).json(roomTypes))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async createRoomType(req, res) {
        const { branch_id, name, description, max_guests, is_active } = req.body;
        const data = {
            branch_id,
            name,
            description,
            max_guests: max_guests ? parseInt(max_guests) : undefined,
            is_active: is_active !== undefined ? is_active === 'true' : undefined
        };
        const files = req.files;
        return await RoomTypeServices.createRoomType(data, files)
            .then(createdRoomType => res.status(201).json(createdRoomType))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async updateRoomType(req, res) {
        const { id } = req.params;
        const { branch_id, name, description, max_guests, images, is_active } = req.body;
        const data = { branch_id, name, description, max_guests, images, is_active };
        return await RoomTypeServices.updateRoomType(id, data)
            .then(updatedRoomType => res.status(200).json(updatedRoomType))
            .catch(error => {
                if (error.code !== 500) {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteRoomType(req, res) {
        const { id } = req.params;
        return await RoomTypeServices.deleteRoomType(id)
            .then(deletedRoomType => res.status(200).json(deletedRoomType))
            .catch(error => {
                if (error.code === "P2025") {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    };

    async deleteRoomTypeImage(req, res) {
        const { img_url, public_id } = req.body;
        return await RoomTypeServices.deleteRoomTypeImage(img_url, public_id)
            .then(deletedRoomTypeImage => res.status(200).json("Deleted image successfully"))
            .catch(error => {
                if (typeof parseInt(error.code) === 'number') {
                    return res.status(parseInt(error.code)).json({ error: error.message });
                }
                res.status(500).json({ error: error.message });
            });
    }
}

export default new RoomTypeController();