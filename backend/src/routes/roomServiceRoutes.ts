import express from 'express';
import RoomServiceController from '../controllers/roomServiceController.ts';

const router = express.Router();

router.get('/', (req, res) => {
    RoomServiceController.getAllServices(req, res);
});

router.get ('/:id', (req, res) => {
    RoomServiceController.getServiceById(req, res);
});

router.post('/', (req, res) => {
    RoomServiceController.createService(req, res);
});

router.put('/:id', (req, res) => {
    RoomServiceController.updateService(req, res);
});

router.delete('/:id', (req, res) => {
    RoomServiceController.deleteService(req, res);
});

export default router;