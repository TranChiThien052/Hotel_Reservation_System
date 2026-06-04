import express from 'express';
import { getAllRoomTypes, getRoomTypeById, createRoomType, updateRoomType, deleteRoomType } from '../controllers/roomTypeController.ts';

const router = express.Router();

router.get('/', (req, res) => {
    getAllRoomTypes(req, res);
});

router.get ('/:id', (req, res) => {
    getRoomTypeById(req, res);
});

router.post('/', (req, res) => {
    createRoomType(req, res);
});

router.put('/:id', (req, res) => {
    updateRoomType(req, res);
});

router.delete('/:id', (req, res) => {
    deleteRoomType(req, res);
});

export default router;