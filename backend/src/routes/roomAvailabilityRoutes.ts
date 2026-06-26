import { Router } from 'express';
import RoomAvailabilityController from '../controllers/roomAvailabilityController';


const router = Router();

router.get('/available-rooms', RoomAvailabilityController.getAvailableRoomCount);
router.get("/available", RoomAvailabilityController.getAvailableRoomCount);
router.get("/search", RoomAvailabilityController.searchAvailableRooms);

export default router;