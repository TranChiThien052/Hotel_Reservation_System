import express from 'express';
import FineItemController from '../controllers/fineItemController.ts';

const router = express.Router();

router.get('/branch/:id', FineItemController.getFineItemsByBranchId);
router.get('/', FineItemController.getAllFineItems);
router.get('/:id', FineItemController.getFineItemById);
router.post('/', FineItemController.createFineItem);
router.put('/:id', FineItemController.updateFineItem);
router.delete('/:id', FineItemController.deleteFineItem);

export default router;
