import express from 'express';
import RoomController from '../controllers/roomController';

const router = express.Router();

router.get('/branch/:id', RoomController.getRoomsByBranchId);

router.get('/', RoomController.getAllRooms);

router.get('/:id', RoomController.getRoomById);

router.post('/', RoomController.createRoom);

router.put('/:id', RoomController.updateRoom);

router.delete('/:id', RoomController.deleteRoom);

export default router;