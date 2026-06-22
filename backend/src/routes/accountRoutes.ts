import express from 'express';
import AccountController from '../controllers/accountController';

const router = express.Router();

/**
 * @swagger
 * /accounts/username/{username}:
 *   get:
 *     summary: Get data
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/username/:username', AccountController.getAccountByUsername)
/**
 * @swagger
 * /accounts:
 *   get:
 *     summary: Get data
 *     tags: [Account]
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/', AccountController.getAllAccounts);
/**
 * @swagger
 * /accounts/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.get('/:id', AccountController.getAccountById);
/**
 * @swagger
 * /accounts:
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
router.post('/', AccountController.createAccount);
/**
 * @swagger
 * /accounts/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.put('/:id', AccountController.updateAccount);
/**
 * @swagger
 * /accounts/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Account]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     responses:
 *       200:
 *         description: Successful operation
 */
router.delete('/:id', AccountController.deleteAccount);

export default router;
