import express from 'express';
import RoomServiceController from '../controllers/roomServiceController';

const router = express.Router();

router.get('/', RoomServiceController.getAllServices);

router.get('/:id', RoomServiceController.getServiceById);

router.post('/', RoomServiceController.createService);

router.put('/:id', RoomServiceController.updateService);

router.delete('/:id', RoomServiceController.deleteService);

export default router;