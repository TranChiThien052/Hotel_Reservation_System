import express from 'express';
import RoomTypeController from '../controllers/roomTypeController.ts';

const router = express.Router();

router.get('/branch/:id', RoomTypeController.getRoomTypesByBranchId);

router.get('/', RoomTypeController.getAllRoomTypes);

router.get ('/:id', RoomTypeController.getRoomTypeById);

router.post('/', RoomTypeController.createRoomType);

router.put('/:id', RoomTypeController.updateRoomType);

router.delete('/:id', RoomTypeController.deleteRoomType);

export default router;