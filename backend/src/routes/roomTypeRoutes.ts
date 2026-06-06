import express from 'express';
import RoomTypeController from '../controllers/roomTypeController.ts';

const router = express.Router();

router.get('/', (req, res) => {
    RoomTypeController.getAllRoomTypes(req, res);
});

router.get ('/:id', (req, res) => {
    RoomTypeController.getRoomTypeById(req, res);
});

router.post('/', (req, res) => {
    RoomTypeController.createRoomType(req, res);
});

router.put('/:id', (req, res) => {
    RoomTypeController.updateRoomType(req, res);
});

router.delete('/:id', (req, res) => {
    RoomTypeController.deleteRoomType(req, res);
});

export default router;