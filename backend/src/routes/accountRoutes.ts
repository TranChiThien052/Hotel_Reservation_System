import express from 'express';
import AccountController from '../controllers/accountController.ts';

const router = express.Router();

router.get('/username/:username', AccountController.getAccountByUsername)
router.get('/', AccountController.getAllAccounts);
router.get('/:id', AccountController.getAccountById);
router.post('/', AccountController.createAccount);
router.put('/:id', AccountController.updateAccount);
router.delete('/:id', AccountController.deleteAccount);

export default router;
