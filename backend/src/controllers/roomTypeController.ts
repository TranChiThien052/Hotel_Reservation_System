import { prisma } from '../config/prisma.ts';

const getAllRoomTypes = async (req, res) => {
    try {
        const roomTypes = await prisma.room_types.findMany();
        res.status(200).json(roomTypes);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve room types: " + error.message });
    }
};

const getRoomTypeById = async (req, res) => {
    try {
        const { id } = req.params;
        const roomType = await prisma.room_types.findUnique({ where: { id: id }});
        if (!roomType) {
            return res.status(404).json({ error: "Room type not found" });
        }
        res.status(200).json(roomType);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve room type: " + error.message });
    }
};

const createRoomType = async (req, res) => {
    try {
        const newRoomType = req.body;
        const createdRoomType = await prisma.room_types.create({ data: newRoomType });
        if(!createdRoomType) {
            return res.status(400).json({ error: "Failed to create room type" });
        }
        res.status(201).json(createdRoomType);
    } catch (error) {
        res.status(500).json({ error: "Failed to create room type: " + error.message });
    }
};

const updateRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const roomType = await prisma.room_types.findUnique({ where: { id: id } });

        if (!roomType) {
            return res.status(404).json({ error: "Room type not found" });
        }
        
        const updateData = {
            ...(data.branch_id && { branch_id: data.branch_id }),
            ...(data.name && { name: data.name }),
            ...(data.description && { description: data.description }),
            ...(data.max_guests && { max_guests: data.max_guests }),
            ...(data.images && { images: data.images }),
            ...(data.is_active !== undefined && { is_active: data.is_active }),
        }
        
        const updatedRoomType = await prisma.room_types.update({ where: { id: id }, data: updateData });
        return res.status(200).json(updatedRoomType);
    } catch (error) {
        res.status(500).json({ error: "Failed to update room type: " + error.message });
    }
};

const deleteRoomType = async (req, res) => {
    try {
        const { id } = req.params;
        const roomType = await prisma.room_types.findUnique({ where: { id: id } });
        if (!roomType) {
            return res.status(404).json({ error: "Room type not found" });
        }
        const deletedRoomType = await prisma.room_types.delete({ where: { id: id } });
        res.status(200).json({ deletedRoomType });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete room type: " + error.message });
    }
};

export { getAllRoomTypes, getRoomTypeById, createRoomType, updateRoomType, deleteRoomType };