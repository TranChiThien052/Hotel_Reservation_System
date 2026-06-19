import express from 'express';
import AccountController from '../controllers/accountController';

const router = express.Router();

router.post('/login', AccountController.login);

router.post('/logout', AccountController.logout);

router.post('/refresh', AccountController.refreshToken);

router.get('/me', AccountController.getAccountInformation);

export default router;