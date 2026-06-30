import express from 'express';
import AccountController from '../controllers/accountController';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Create new record
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post('/login', AccountController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Create new record
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post('/logout', AccountController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Create new record
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Successful operation
 */
router.post('/refresh', AccountController.refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get data
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/me', AccountController.getAccountInformation);

router.post('/request-password-reset', AccountController.requestResetPassword);

router.post('/reset-password', AccountController.resetPassword);

export default router;