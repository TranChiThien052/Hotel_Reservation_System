import express from 'express';
import { getAllRooms, getRoomsByBranchId, getRoomById, createRoom, updateRoom, deleteRoom } from '../controllers/roomController.ts';

const router = express.Router();

router.get('/branch/:id', (req, res) => {
    getRoomsByBranchId(req, res);
});

router.get('/', (req, res) => {
    getAllRooms(req, res);
});

router.get ('/:id', (req, res) => {
    getRoomById(req, res);
});

router.post('/', (req, res) => {
    createRoom(req, res);
});

router.put('/:id', (req, res) => {
    updateRoom(req, res);
});

router.delete('/:id', (req, res) => {
    deleteRoom(req, res);
});

export default router;