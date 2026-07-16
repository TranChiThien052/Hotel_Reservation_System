import express from 'express';
import CustomerController from '../controllers/customerController';
import { authorize } from '../middlewares/authorizer';

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
 *                              accounts:
 *                                  type: object
 *                                  properties:
 *                                     id:
 *                                         type: string
 *                                         format: uuid
 *                                     username:
 *                                         type: string
 *                                     status:
 *                                         type: string
 *                                         format: enum
 *                                         enum: ['active', 'inactive']
 *                                     branch_id:
 *                                         type: string
 *                                         format: uuid
 *       500:
 *         description: Internal server error
 */
router.get('/', (req, res) => {
    authorize(req, res, ["staff", "admin", "manager"], () => CustomerController.getAllCustomers(res, req))
});
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
 *                       accounts:
 *                          type: object
 *                          properties:
 *                             id:
 *                                type: string
 *                                format: uuid
 *                             username:
 *                                type: string
 *                             status:
 *                                type: string
 *                                format: enum
 *                                enum: ['active', 'inactive']
 *                             branch_id:
 *                                type: string
 *                                format: uuid
 *       404:
 *         description: Customer not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "admin", "manager"], () => CustomerController.getCustomerById(req, res))
});
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
router.post('/', (req, res) => {
    authorize(req, res, ["staff", "admin", "manager"], () => CustomerController.createCustomer(req, res))
});
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
router.put('/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => CustomerController.updateCustomer(req, res))
});
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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["staff", "manager", "admin"], () => CustomerController.deleteCustomer(req, res))
});

export default router;
