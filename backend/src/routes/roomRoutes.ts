import express from 'express';
import RoomController from '../controllers/roomController.ts';

const router = express.Router();

router.get('/branch/:id', (req, res) => {
    RoomController.getRoomsByBranchId(req, res);
});

router.get('/', (req, res) => {
    RoomController.getAllRooms(req, res);
});

router.get ('/:id', (req, res) => {
    RoomController.getRoomById(req, res);
});

router.post('/', (req, res) => {
    RoomController.createRoom(req, res);
});

router.put('/:id', (req, res) => {
    RoomController.updateRoom(req, res);
});

router.delete('/:id', (req, res) => {
    RoomController.deleteRoom(req, res);
});

export default router;