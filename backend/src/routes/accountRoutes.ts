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
 *         content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id: 
 *                              type: string
 *                          username: 
 *                              type: string
 *                          password_hash: 
 *                              type: string
 *                          status: 
 *                              type: string
 *                          role: 
 *                              type: string
 *                          branch_id: 
 *                              type: string
 *                          branches:
 *                              type: object
 *                              properties:
 *                                  id: 
 *                                      type: string
 *                                  name: 
 *                                      type: string
 *                          staff: 
 *                              type: object
 *                              properties:
 *                                  id: 
 *                                      type: string
 *                          customer:
 *                              type: object
 *                              properties:
 *                                  id: 
 *                                      type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
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
 *         content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id: 
 *                              type: string
 *                          username: 
 *                              type: string
 *                          password_hash: 
 *                              type: string
 *                          status: 
 *                              type: string
 *                          role: 
 *                              type: string
 *                          branch_id: 
 *                              type: string
 *       500:
 *         description: Internal server error
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
 *       500:
 *         description: Internal Server error
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
 *       200:
 *         description: Successful operation
 *         content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          id: 
 *                              type: string
 *                          username: 
 *                              type: string
 *                          password_hash: 
 *                              type: string
 *                          status: 
 *                              type: string
 *                          role: 
 *                              type: string
 *                          branch_id: 
 *                              type: string
 *       400:
 *         description: Validation error
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Internal server error
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
 *       400:
 *         description: Validation error
 *       404:
 *         description: Record or foreign key not found
 *       500:
 *         description: Internal server error
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
 *       404:
 *         description: Record not found
 */
router.delete('/:id', AccountController.deleteAccount);

export default router;
