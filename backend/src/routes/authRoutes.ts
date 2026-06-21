import express from 'express';
import AccountController from '../controllers/accountController';

const router = express.Router();

/**
 * @swagger
 * /auths/login:
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
 * /auths/logout:
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
 * /auths/refresh:
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
router.post('/refresh', AccountController.refreshToken);

/**
 * @swagger
 * /auths/me:
 *   get:
 *     summary: Get data
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/me', AccountController.getAccountInformation);

export default router;