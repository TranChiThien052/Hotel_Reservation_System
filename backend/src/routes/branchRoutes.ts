import express from 'express';

import BranchController from '../controllers/branchController';

const router = express.Router();

router.get('/', BranchController.getAllBranches);

router.get('/:id', BranchController.getBranchById);

router.post('/', BranchController.createBranch);

router.put('/:id', BranchController.updateBranch);

router.delete('/:id', BranchController.deleteBranch);

export default router;