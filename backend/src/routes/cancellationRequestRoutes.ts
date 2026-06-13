import express from 'express';
import CancellationRequestController from '../controllers/cancellationRequestController.ts';

const router = express.Router();

router.get('/', CancellationRequestController.getAllCancellationRequests);
router.get('/:id', CancellationRequestController.getCancellationRequestById);
router.post('/', CancellationRequestController.createCancellationRequest);
router.put('/:id', CancellationRequestController.updateCancellationRequest);
router.delete('/:id', CancellationRequestController.deleteCancellationRequest);

export default router;
