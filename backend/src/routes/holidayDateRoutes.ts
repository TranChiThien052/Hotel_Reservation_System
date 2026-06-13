import express from 'express';
import HolidayDateController from '../controllers/holidayDateController.ts';

const router = express.Router();

router.get('/', HolidayDateController.getAllHolidayDates);
router.get('/:id', HolidayDateController.getHolidayDateById);
router.post('/', HolidayDateController.createHolidayDate);
router.put('/:id', HolidayDateController.updateHolidayDate);
router.delete('/:id', HolidayDateController.deleteHolidayDate);

export default router;
