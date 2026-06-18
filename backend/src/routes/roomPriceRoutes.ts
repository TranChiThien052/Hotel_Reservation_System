import express from 'express';
import RoomPriceController from '../controllers/roomPriceController';

const router = express.Router();

router.get('/room-type/:id', RoomPriceController.getRoomPricesByRoomTypeId);

router.get('/', RoomPriceController.getAllRoomPrices);

router.get('/:id', RoomPriceController.getRoomPriceById);

router.post('/', RoomPriceController.createRoomPrice);

router.put('/:id', RoomPriceController.updateRoomPrice);

router.delete('/:id', RoomPriceController.deleteRoomPrice);

export default router;