import { prisma } from '../config/prisma.ts';

const getAllRoomPrices = async (req, res) => {
    try {
        const roomPrices = await prisma.room_prices.findMany();
        res.status(200).json(roomPrices);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve room prices: " + error.message });
    }
};

const getRoomPricesByRoomTypeId = async (req, res) => {
    try {
        const { id } = req.params;
        const roomPrices = await prisma.room_prices.findFirst({ where: { room_type_id: id } });
        res.status(200).json(roomPrices);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve room prices: " + error.message });
    }
};

const getRoomPriceById = async (req, res) => {
    try {
        const { id } = req.params;
        const roomPrice = await prisma.room_prices.findUnique({ where: { id: id }});
        if (!roomPrice) {
            return res.status(404).json({ error: "Room price not found" });
        }
        res.status(200).json(roomPrice);
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve room price: " + error.message });
    }
};

const createRoomPrice = async (req, res) => {
    try {
        const newRoomPrice = req.body;
        const createdRoomPrice = await prisma.room_prices.create({ data: newRoomPrice });
        if(!createdRoomPrice) {
            return res.status(400).json({ error: "Failed to create room price" });
        }
        res.status(201).json(createdRoomPrice);
    } catch (error) {
        res.status(500).json({ error: "Failed to create room price: " + error.message });
    }
};

const updateRoomPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const roomPrice = await prisma.room_prices.findUnique({ where: { id: id } });

        if (!roomPrice) {
            return res.status(404).json({ error: "Room price not found" });
        }

        const updateData = {
        ...(data.room_type_id && { room_type_id: data.room_type_id }),
        ...(data.price_per_day && { price_per_day: data.price_per_day }),
        ...(data.price_per_hour && { price_per_hour: data.price_per_hour }),
        ...(data.weekend_rate && { weekend_rate: data.weekend_rate }),
        ...(data.holiday_rate && { holiday_rate: data.holiday_rate }),
        ...(data.effective_from && { effective_from: data.effective_from }),
        ...(data.effective_to && { effective_to: data.effective_to }),
        }

        const updatedRoomPrice = await prisma.room_prices.update({ where: { id: id }, data: updateData });
        res.status(200).json(updatedRoomPrice);
    } catch (error) {
        res.status(500).json({ error: "Failed to update room price: " + error.message });
    }
};

const deleteRoomPrice = async (req, res) => {
    try {
        const { id } = req.params;
        const roomPrice = await prisma.room_prices.findUnique({ where: { id: id } });
        if (!roomPrice) {
            return res.status(404).json({ error: "Room price not found" });
        }
        await prisma.room_prices.delete({ where: { id: id } });
        res.status(200).json({ message: "Room price deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete room price: " + error.message });
    }   
};

export { getAllRoomPrices, getRoomPricesByRoomTypeId, getRoomPriceById, createRoomPrice, updateRoomPrice, deleteRoomPrice };