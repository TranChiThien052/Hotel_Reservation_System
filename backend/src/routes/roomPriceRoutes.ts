import express from 'express';
import { getAllRoomPrices, getRoomPricesByRoomTypeId, getRoomPriceById, createRoomPrice, updateRoomPrice, deleteRoomPrice } from '../controllers/roomPriceController.ts';

const router = express.Router();

router.get('/room-type/:id', (req, res) => {
    getRoomPricesByRoomTypeId(req, res);
});

router.get('/', (req, res) => {
    getAllRoomPrices(req, res);
});

router.get ('/:id', (req, res) => {
    getRoomPriceById(req, res);
});

router.post('/', (req, res) => {
    createRoomPrice(req, res);
});

router.put('/:id', (req, res) => {
    updateRoomPrice(req, res);
});

router.delete('/:id', (req, res) => {
    deleteRoomPrice(req, res);
});

export default router;