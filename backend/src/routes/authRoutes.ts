import express from 'express';
import AccountController from '../controllers/accountController';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Start session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username
 *               password:
 *                 type: string
 *                 description: Password
 *     responses:
 *       201:
 *         description: Successful operation
 *         headers:
 *            Set-Cookie:
 *              description: Refresh token cookie
 *              schema:
 *                 type: string
 *                 example: refresh_token=abc123; HttpOnly; Path=/; Secure
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     access_token:
 *                        type: string
 *                        description: Access token
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Account not found
 *       403:
 *         description: Account is not active
 *       500:
 *         description: Internal server error
 */
router.post('/login', AccountController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from customer's session
 *     security:
 *       - refresh_token: []
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Logout successfully
 *         headers:
 *            Set-Cookie:
 *              description: Clear refresh token cookie
 *              schema:
 *                 type: string
 *                 example: refresh_token=; HttpOnly; Path=/; Secure
 *       400:
 *         description: Invalid data
 *       404:
 *         description: Refresh token not found
 *       500:
 *         description: Internal server error
 */
router.post('/logout', AccountController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh session's access token 
 *     security:
 *       - refresh_token: []
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Refresh token successfully
 *         headers:
 *            Set-Cookie:
 *              description: Refresh token cookie
 *              schema:
 *                 type: string
 *                 example: refresh_token=abc123; HttpOnly; Path=/; Secure
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   access_token:
 *                     type: string
 *                     description: Access token
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Account is not active
 *       404:
 *         description: Refresh token not found
 *       500:
 *         description: Internal server error
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

/**
 * @swagger
 * /auth/request-password-reset:
 *   post:
 *     summary: Create new record
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email address
 *     responses:
 *       201:
 *         description: Successful operation
 *         content:
 *            application/json:
 *               schema:
 *                  type: object
 *                  properties:
 *                     message:
 *                        type: Password reset email sent successfully
 *                        description: Message
 *       404:
 *         description: Account not found
 *       500:
 *         description: Internal server error
 */
router.post('/request-password-reset', AccountController.requestResetPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Create new record
 *     tags: [Auth]
 *     parameters:
 *       - name: token
 *         in: query
 *         required: true
 *         schema:
 *            type: string
 *         description: Password reset token attach in URL from email 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: New password
 *     responses:
 *       201:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *                   description: Message
 *       400:
 *         description: Token is not valid
 *       404:
 *         description: Token not found
 *       500:
 *         description: Internal server error
 */
router.post('/reset-password', AccountController.resetPassword);

export default router;