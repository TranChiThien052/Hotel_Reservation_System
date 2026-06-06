import express from 'express';

import BranchController from '../controllers/branchController.ts';

const router = express.Router();

router.get('/', (req, res) => {
    BranchController.getAllBranches(req, res);
});

router.get('/:id', (req, res) => {
    BranchController.getBranchById(req, res);
});

router.post('/', (req, res) => {
    BranchController.createBranch(req, res);
});

router.put('/:id', (req, res) => {
    BranchController.updateBranch(req, res);
});

router.delete('/:id', (req, res) => {
    BranchController.deleteBranch(req, res);
});

export default router;