import express from 'express';

import { getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch } from '../controllers/branchController.ts';

const router = express.Router();

router.get('/', (req, res) => {
    getAllBranches(req, res);
});

router.get('/:id', (req, res) => {
    getBranchById(req, res);
});

router.post('/', (req, res) => {
    createBranch(req, res);
});

router.put('/:id', (req, res) => {
    updateBranch(req, res);
});

router.delete('/:id', (req, res) => {
    deleteBranch(req, res);
});
    
export default router;