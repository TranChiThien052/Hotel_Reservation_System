import express from 'express';
import CustomerController from '../controllers/customerController';

const router = express.Router();

/**
 * @swagger
 * /customers:
 *   get:
 *     summary: Get data
 *     tags: [Customer]
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items:
 *                          type: object
 *                          properties:
 *                              id: 
 *                                  type: string
 *                              account_id:
 *                                  type: string
 *                              full_name:
 *                                  type: string
 *                              phone:
 *                                  type: string
 *                              email:
 *                                  type: string
 *                              id_card_number:
 *                                  type: string
 *                              nationality:
 *                                  type: string
 *                              date_of_birth:
 *                                  type: string
 *                              address:
 *                                  type: string
 *       500:
 *         description: Internal server error
 */
router.get('/', CustomerController.getAllCustomers);
/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get data
 *     tags: [Customer]
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
 *         content:
 *             application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                       id:
 *                         type: string
 *                       account_id:
 *                          type: string
 *                       full_name:
 *                          type: string
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                       id_card_number:
 *                         type: string
 *                       nationality:
 *                         type: string
 *                       date_of_birth:
 *                         type: string
 *                       address:
 *                         type: string
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', CustomerController.getCustomerById);
/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create new record
 *     tags: [Customer]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               id_card_number:
 *                 type: string
 *               nationality:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 account_id:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 id_card_number:
 *                   type: string
 *                 nationality:
 *                   type: string
 *                 date_of_birth:
 *                   type: string
 *                 address:
 *                   type: string
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post('/', CustomerController.createCustomer);
/**
 * @swagger
 * /customers/{id}:
 *   put:
 *     summary: Update record
 *     tags: [Customer]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The id parameter
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               account_id:
 *                 type: string
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               id_card_number:
 *                 type: string
 *               nationality:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 account_id:
 *                   type: string
 *                 full_name:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 email:
 *                   type: string
 *                 id_card_number:
 *                   type: string
 *                 nationality:
 *                   type: string
 *                 date_of_birth:
 *                   type: string
 *                 address:
 *                   type: string
 *       400:
 *         description: Bad request
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', CustomerController.updateCustomer);
/**
 * @swagger
 * /customers/{id}:
 *   delete:
 *     summary: Delete record
 *     tags: [Customer]
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
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', CustomerController.deleteCustomer);

export default router;
