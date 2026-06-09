import express from 'express';
import AccountController from '../controllers/accountController.ts';

const router = express.Router();

router.get('/', (req, res) => {
    AccountController.getAllAccounts(req, res);
});
router.get('/:id', (req, res) => {
    AccountController.getAccountById(req, res);
});
router.post('/', (req, res) => {
    AccountController.createAccount(req, res);
});
router.put('/:id', (req, res) => {
    AccountController.updateAccount(req, res);
});
router.delete('/:id', (req, res) => {
    AccountController.deleteAccount(req, res);
});

export default router;
