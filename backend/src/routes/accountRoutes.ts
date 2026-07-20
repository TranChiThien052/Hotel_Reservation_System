import express from 'express';
import AccountController from '../controllers/accountController';
import { authorize } from '../middlewares/authorizer';

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
router.get('/username/:username', async (req, res) => {
    await authorize(req, res, ["manager", "admin"], () => AccountController.getAccountByUsername(req, res))
})
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
router.get('/', async (req, res) => {
    await authorize(req, res, ["manager", "admin"], () => AccountController.getAllAccounts(req, res))
});
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
router.get('/:id', async (req, res) => {
    await authorize(req, res, ["staff", "manager", "admin"], () => AccountController.getAccountById(req, res))
});
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
 *                          password: 
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
router.post('/', async (req, res) => {
    await authorize(req, res, ["staff", "manager", "admin"], () => AccountController.createAccount(req, res))
});
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
router.put('/:id', (req, res) => {
    authorize(req, res, ["customer", "staff", "manager", "admin"], () => AccountController.updateAccount(req, res))
});
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
router.delete('/:id', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => AccountController.deleteAccount(req, res))
});

/**
 * @swagger
 * /accounts/register/staff:
 *   post:
 *     summary: Create new staff account
 *     tags: [Account]
 *     security:
 *       - bearerAuth:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - full_name
 *               - role
 *               - status
 *               - phone
 *               - branch_id
 *             properties:
 *               username:
 *                 type: string
 *                 description: Account username
 *                 example: string
 *               password:
 *                 type: string
 *                 description: Account password
 *                 example: string
 *               full_name:
 *                 type: string
 *                 description: Staff full name
 *                 example: string
 *               role:
 *                 type: string
 *                 description: staff, manager or admin
 *                 example: staff
 *               status:
 *                 type: string
 *                 description: active or inactive
 *                 example: active
 *               phone:
 *                 type: string
 *                 description: Staff phone number
 *                 example: 0912345678
 *               branch_id:
 *                 type: string
 *                 description: Branch ID
 *                 example: b0116409-3b98-4646-967d-08da6f247a9c
 *     responses:
 *           200:
 *              description: Succesful operation
 *              content:
 *                 application/json:
 *                    schema:
 *                       type: object
 *                       properties:
 *                          created_account:
 *                             type: object
 *                             properties:
 *                                id:
 *                                   type: string
 *                                username:
 *                                   type: string
 *                                role:
 *                                   type: string
 *                                status:
 *                                   type: string
 *                                branch_id:
 *                                   type: string
 *                          created_staff:
 *                             type: object
 *                             properties:
 *                                id:
 *                                   type: string
 *                                branch_id:
 *                                   type: string
 *                                account_id:
 *                                   type: string
 *                                full_name:
 *                                   type: string
 *                                phone:
 *                                   type: string
 *                                position:
 *                                   type: string
 *           400:
 *              description: Bad request
 *           404:
 *              description: Branch not found           
 *           409:
 *              description: Phone number or username already exists
 *           500:
 *              description: Internal server error
 */
router.post('/register/staff', (req, res) => {
    authorize(req, res, ["manager", "admin"], () => AccountController.createStaffAccount(req, res))
});

/**
 * @swagger
/accounts/register/customer:
 *   post:
 *     summary: Create new customer account
 *     tags: [Account]
 *     security:
 *       - bearerAuth:
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - full_name
 *               - phone
 *               - email
 *               - password
 *             properties:
 *               full_name:
 *                 type: string
 *                 description: Customer full name
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 description: Account password
 *                 example: string
 *               phone:
 *                 type: string
 *                 description: Customer phone number
 *                 example: 0912345678
 *               email:
 *                 type: string
 *                 description: Customer email address
 *                 example: customer@abc.com
 *     responses:
 *           200:
 *              description: Succesful operation
 *              content:
 *                 application/json:
 *                    schema:
 *                       type: object
 *                       properties:
 *                          created_account:
 *                             type: object
 *                             properties:
 *                                id:
 *                                   type: string
 *                                username:
 *                                   type: string
 *                                role:
 *                                   type: string
 *                                status:
 *                                   type: string
 *                                branch_id:
 *                                   type: string
 *                          created_customer:
 *                             type: object
 *                             properties:
 *                                id:
 *                                   type: string
 *                                account_id:
 *                                   type: string
 *                                full_name:
 *                                   type: string
 *                                phone:
 *                                   type: string
 *                                email:
 *                                   type: string
 *                                id_card_number:
 *                                   type: string
 *                                nationality:
 *                                   type: string
 *                                date_of_birth:
 *                                   type: string
 *                                   format: date
 *                                address:
 *                                   type: string
 *           400:
 *              description: Bad request
 *           409:
 *              description: Phone number or username already exists
 *           500:
 *              description: Internal server error
 */
router.post('/register/customer', AccountController.createCustomerAccount);

export default router;
