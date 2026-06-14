import express from 'express';
import StaffController from '../controllers/staffController.ts';

const router = express.Router();

router.get('/', StaffController.getAllStaff);
router.get('/:id', StaffController.getStaffById);
router.post('/', StaffController.createStaff);
router.put('/:id', StaffController.updateStaff);
router.delete('/:id', StaffController.deleteStaff);

export default router;
