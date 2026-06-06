import express from 'express';
import RoomPriceController from '../controllers/roomPriceController.ts';

const router = express.Router();

router.get('/room-type/:id', (req, res) => {
    RoomPriceController.getRoomPricesByRoomTypeId(req, res);
});

router.get('/', (req, res) => {
    RoomPriceController.getAllRoomPrices(req, res);
});

router.get ('/:id', (req, res) => {
    RoomPriceController.getRoomPriceById(req, res);
});

router.post('/', (req, res) => {
    RoomPriceController.createRoomPrice(req, res);
});

router.put('/:id', (req, res) => {
    RoomPriceController.updateRoomPrice(req, res);
});

router.delete('/:id', (req, res) => {
    RoomPriceController.deleteRoomPrice(req, res);
});

export default router;