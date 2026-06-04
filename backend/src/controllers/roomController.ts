import { prisma } from '../config/prisma.ts';

const getAllRooms = async (req, res) => {
    try {
        const rooms = await prisma.rooms.findMany();
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve rooms: " + error.message });
    }
};

const getRoomsByBranchId = async (req, res) => {
    try {
        const { id } = req.params;
        const rooms = await prisma.rooms.findMany({ where: { branch_id: id }});
        res.status(200).json(rooms);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve rooms: " + error.message });
    }
};

const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await prisma.rooms.findUnique({ where: { id: id }});
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve room: " + error.message });
    }
};

const createRoom = async (req, res) => {
    try {
        const newRoom = req.body;
        const createdRoom = await prisma.rooms.create({ data: newRoom });
        if(!createdRoom) {
            return res.status(400).json({ error: "Failed to create room" });
        }
        res.status(201).json(createdRoom);
    } catch (error) {
        res.status(500).json({ error: "Failed to create room: " + error.message });
    }
};

const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const room = await prisma.rooms.findUnique({ where: { id: id } });

        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }

        const updateData = {
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

        const updatedRoom = await prisma.rooms.update({ where: { id: id }, data: updateData });
        return res.status(200).json(updatedRoom);
    } catch (error) {
        res.status(500).json({ error: "Failed to update room: " + error.message });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;
        const room = await prisma.rooms.findUnique({ where: { id: id } });
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        const deletedRoom = await prisma.rooms.delete({ where: { id: id } });
        res.status(200).json({ deletedRoom });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete room: " + error.message });
    }
};

export { getAllRooms, getRoomsByBranchId, getRoomById, createRoom, updateRoom, deleteRoom };